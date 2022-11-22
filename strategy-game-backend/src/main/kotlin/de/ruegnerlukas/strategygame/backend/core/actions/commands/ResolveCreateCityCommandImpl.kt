package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Province
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TileInfluence
import de.ruegnerlukas.strategygame.backend.ports.models.TileOwner
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.ReservationInsert
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.RGBColor
import de.ruegnerlukas.strategygame.backend.shared.distance
import de.ruegnerlukas.strategygame.backend.shared.max
import de.ruegnerlukas.strategygame.backend.shared.positionsCircle
import de.ruegnerlukas.strategygame.backend.shared.validation.ValidationContext
import de.ruegnerlukas.strategygame.backend.shared.validation.validations
import kotlin.math.max

class ResolveCreateCityCommandImpl(
    private val reservationInsert: ReservationInsert,
    private val gameConfig: GameConfig,
) : ResolveCreateCityCommand, Logging {

    private val metricId = MonitoringService.metricCoreAction(ResolveCreateCityCommand::class)


    override suspend fun perform(
        command: Command<CreateCityCommandData>,
        game: GameExtended
    ): Either<ResolveCommandsAction.ResolveCommandsActionError, List<CommandResolutionError>> {
        return Monitoring.coTime(metricId) {
            log().info("Resolving '${command.data.displayName()}'-command for game ${game.game.gameId} and country ${command.countryId}")
            either {
                val cmdData = command.data
                val country = findCountry(command.countryId, game).bind()
                val targetTile = findTile(cmdData.q, cmdData.r, game).bind()
                CreateCityValidations.validateCommand(gameConfig, cmdData.name, game, country, targetTile, cmdData.withNewProvince)
                    .ifInvalid<Unit> { reasons ->
                        return@either reasons.map { CommandResolutionError(command, it) }
                    }
                val createNewProvince = cmdData.withNewProvince || targetTile.owner == null
                val cityId: String
                if (createNewProvince) {
                    cityId = createCity(game, country.countryId, targetTile, cmdData.name, true)
                    createProvince(game, country.countryId, cityId)
                } else {
                    cityId = createCity(game, country.countryId, targetTile, cmdData.name, false)
                    val provinceId = targetTile.owner?.provinceId ?: throw Exception("No province is owning target tile")
                    game.provinces.find { it.provinceId == provinceId }?.cityIds?.add(cityId)
                }
                updateTiles(game, cityId)
                updateCountryResources(country)
                emptyList()
            }
        }
    }


    private fun findCountry(countryId: String, state: GameExtended): Either<ResolveCommandsAction.ResolveCommandsActionError, Country> {
        val country = state.countries.find { it.countryId == countryId }
        if (country == null) {
            return ResolveCommandsAction.CountryNotFoundError.left()
        } else {
            return country.right()
        }
    }


    private fun findTile(q: Int, r: Int, state: GameExtended): Either<ResolveCommandsAction.ResolveCommandsActionError, Tile> {
        val targetTile = state.tiles.find { it.position.q == q && it.position.r == r }
        if (targetTile == null) {
            return ResolveCommandsAction.TileNotFoundError.left()
        } else {
            return targetTile.right()
        }
    }


    private suspend fun createProvince(game: GameExtended, countryId: String, provinceCapitalCityId: String): String {
        return Province(
            provinceId = reservationInsert.reserveProvince(),
            countryId = countryId,
            cityIds = mutableListOf(provinceCapitalCityId),
            provinceCapitalCityId = provinceCapitalCityId,
        ).also { game.provinces.add(it) }.provinceId
    }


    private suspend fun createCity(game: GameExtended, countryId: String, tile: Tile, name: String, isProvinceCapital: Boolean): String {
        return City(
            cityId = reservationInsert.reserveCity(),
            countryId = countryId,
            tile = TileRef(tile.tileId, tile.position.q, tile.position.r),
            name = name,
            color = RGBColor.random(),
            isProvinceCapital = isProvinceCapital,
            buildings = mutableListOf(),
        ).also { game.cities.add(it) }.cityId
    }


    private fun updateCountryResources(country: Country) {
        country.resources.money -= gameConfig.cityCostMoney
    }


    private fun updateTiles(game: GameExtended, cityId: String) {
        val city = game.cities.find { it.cityId == cityId } ?: throw Exception("Could not find created city")
        positionsCircle(city.tile, 5) { q, r ->
            game.tiles.find { it.position.q == q && it.position.r == r }?.let { tile ->
                updateTile(game, tile)
            }
        }
    }


    private fun updateTile(game: GameExtended, tile: Tile) {
        tile.influences.clear()
        game.cities.forEach { city ->
            val province = game.provinces.find { it.cityIds.contains(city.cityId) } ?: throw Exception("Could not find province for city")
            updateTileInfluences(tile, city, province)
            updateTileOwner(tile)
            updateDiscoveredTilesByInfluence(game, tile)
        }
    }


    private fun updateTileInfluences(tile: Tile, city: City, province: Province) {
        val cityInfluence = if (city.isProvinceCapital) {
            calcInfluence(tile.position.distance(city.tile), gameConfig.cityInfluenceSpread, gameConfig.cityInfluenceAmount)
        } else {
            calcInfluence(tile.position.distance(city.tile), gameConfig.townInfluenceSpread, gameConfig.townInfluenceAmount)
        }
        if (cityInfluence > 0) {
            addTileInfluence(tile, city, province, cityInfluence)
        }
    }


    private fun addTileInfluence(tile: Tile, city: City, province: Province, influenceValue: Double) {
        tile.influences.add(
            TileInfluence(
                countryId = city.countryId,
                provinceId = province.provinceId,
                cityId = city.cityId,
                amount = influenceValue
            )
        )
    }


    private fun calcInfluence(distance: Int, spread: Float, amount: Float): Double {
        return max((-(distance.toDouble() / spread) + 1) * amount, 0.0)
    }


    private fun updateTileOwner(tile: Tile) {
        if (tile.owner == null) {
            val maxInfluence = tile.influences.max { it.amount }
            if (maxInfluence != null && maxInfluence.amount >= gameConfig.tileOwnerInfluenceThreshold) {
                tile.owner = TileOwner(
                    countryId = maxInfluence.countryId,
                    provinceId = maxInfluence.provinceId,
                    cityId = maxInfluence.cityId
                )
            }
        }
    }


    private fun updateDiscoveredTilesByInfluence(game: GameExtended, tile: Tile) {
        game.countries
            .filter { !hasDiscovered(it.countryId, tile) }
            .forEach { country ->
                if (tile.owner?.countryId == country.countryId || hasInfluence(country.countryId, tile)) {
                    tile.discoveredByCountries.add(country.countryId)
                }
            }
    }


    private fun hasDiscovered(countryId: String, tile: Tile) = tile.discoveredByCountries.contains(countryId)


    private fun hasInfluence(countryId: String, tile: Tile) = tile.influences.any { it.countryId == countryId }

}


private object CreateCityValidations {

    fun validateCommand(
        gameConfig: GameConfig,
        name: String,
        game: GameExtended,
        country: Country,
        targetTile: Tile,
        withNewProvince: Boolean
    ): ValidationContext {
        return validations(false) {
            validName(name)
            validTargetTileType(targetTile)
            validTileSpace(targetTile, game.cities)
            validResources(gameConfig, country)
            if (withNewProvince) {
                validTileOwnerWithNewProvince(country, targetTile)
                validTileInfluence(gameConfig, country, targetTile)
            } else {
                validTileOwnerInExistingProvince(country, targetTile)
            }
        }
    }

    fun ValidationContext.validName(name: String) {
        validate("CITY.NAME") {
            name.isNotBlank()
        }
    }

    fun ValidationContext.validTargetTileType(tile: Tile) {
        validate("CITY.TARGET_TILE_TYPE") {
            tile.data.terrainType == TileType.LAND.name
        }
    }

    fun ValidationContext.validTileSpace(target: Tile, cities: List<City>) {
        validate("CITY.TILE_SPACE") {
            cities.find { it.tile.tileId == target.tileId } == null
        }
    }

    fun ValidationContext.validResources(gameConfig: GameConfig, country: Country) {
        validate("CITY.RESOURCES") {
            country.resources.money >= gameConfig.cityCostMoney
        }
    }

    fun ValidationContext.validTileOwnerInExistingProvince(country: Country, target: Tile) {
        validate("CITY.TARGET_TILE_OWNER") {
            target.owner?.countryId == country.countryId
        }
    }

    fun ValidationContext.validTileOwnerWithNewProvince(country: Country, target: Tile) {
        validate("CITY.TARGET_TILE_OWNER") {
            target.owner == null || target.owner?.countryId == country.countryId
        }
    }

    fun ValidationContext.validTileInfluence(gameConfig: GameConfig, country: Country, target: Tile) {
        validate("CITY.COUNTRY_INFLUENCE") {
            // country owns tile
            if (target.owner != null && target.owner?.countryId == country.countryId) {
                return@validate true
            }
            // nobody else has more than 'MAX_TILE_INFLUENCE' influence
            val maxForeignInfluence = target.influences.filter { it.countryId != country.countryId }.map { it.amount }.max { it } ?: 0.0
            if (maxForeignInfluence < gameConfig.cityTileMaxForeignInfluence) {
                return@validate true
            }
            // country has the most influence on tile
            val maxCountryInfluence = target.influences.filter { it.countryId == country.countryId }.map { it.amount }.max { it } ?: 0.0
            if (maxCountryInfluence >= maxForeignInfluence) {
                return@validate true
            }
            return@validate false
        }
    }

}