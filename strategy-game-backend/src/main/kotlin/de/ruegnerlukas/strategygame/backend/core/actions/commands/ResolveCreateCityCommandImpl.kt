package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.core.actions.commands.CreateCityValidations.validateCommand
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.RGBColor
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CreateCityCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileOwner
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.ReservationInsert
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.max
import de.ruegnerlukas.strategygame.backend.shared.positionsCircle
import de.ruegnerlukas.strategygame.backend.shared.validation.ValidationContext
import de.ruegnerlukas.strategygame.backend.shared.validation.validations

class ResolveCreateCityCommandImpl(
    private val reservationInsert: ReservationInsert,
    private val gameConfig: GameConfig,
) : ResolveCreateCityCommand, Logging {

    private val metricId = metricCoreAction(ResolveCreateCityCommand::class)

    override suspend fun perform(
        command: CommandEntity<CreateCityCommandDataEntity>,
        game: GameExtendedEntity
    ): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
        return Monitoring.coTime(metricId) {
            log().info("Resolving '${command.data.type}'-command for game ${game.game.key} and country ${command.countryId}")
            either {
                val country = findCountry(command.countryId, game).bind()
                val targetTile = findTile(command.data.q, command.data.r, game).bind()
                validateCommand(gameConfig, command.data.name, game, country, targetTile).ifInvalid<Unit> { reasons ->
                    return@either reasons.map { CommandResolutionError(command, it) }
                }
                val cityId = createCity(game, country.getKeyOrThrow(), targetTile, command.data.name)
                switchTileCityOwner(game, country.getKeyOrThrow(), cityId, targetTile)
                updateCountryResources(country)
                emptyList()
            }
        }
    }


    private fun findCountry(countryId: String, state: GameExtendedEntity): Either<ResolveCommandsActionError, CountryEntity> {
        val country = state.countries.find { it.key == countryId }
        if (country == null) {
            return ResolveCommandsAction.CountryNotFoundError.left()
        } else {
            return country.right()
        }
    }


    private fun findTile(q: Int, r: Int, state: GameExtendedEntity): Either<ResolveCommandsActionError, TileEntity> {
        val targetTile = state.tiles.find { it.position.q == q && it.position.r == r }
        if (targetTile == null) {
            return ResolveCommandsAction.TileNotFoundError.left()
        } else {
            return targetTile.right()
        }
    }


    private suspend fun createCity(game: GameExtendedEntity, countryId: String, tile: TileEntity, name: String): String {
        return CityEntity(
            gameId = tile.gameId,
            countryId = countryId,
            tile = TileRef(tile.getKeyOrThrow(), tile.position.q, tile.position.r),
            name = name,
            color = RGBColor.random(),
            city = true,
            parentCity = null,
            buildings = mutableListOf(),
            key = reservationInsert.reserveCity()
        ).also { game.cities.add(it) }.getKeyOrThrow()
    }


    private fun switchTileCityOwner(game: GameExtendedEntity, countryId: String, cityId: String, targetTile: TileEntity) {
        positionsCircle(targetTile.position, 1) { q, r ->
            game.tiles.find { it.position.q == q && it.position.r == r }?.let { tile ->
                val otherCity = game.cities.find { it.tile.tileId == tile.getKeyOrThrow() }
                if (tile.owner?.countryId == countryId && !(otherCity != null && otherCity.city)) {
                    tile.owner = TileOwner(countryId, cityId)
                    otherCity?.parentCity = cityId
                }
            }
        }
    }


    private fun updateCountryResources(country: CountryEntity) {
        country.resources.money -= gameConfig.cityCostMoney
    }

}


private object CreateCityValidations {

    fun validateCommand(
        gameConfig: GameConfig,
        name: String,
        game: GameExtendedEntity,
        country: CountryEntity,
        targetTile: TileEntity
    ): ValidationContext {
        return validations(false) {
            validName(name)
            validTargetTileType(targetTile)
            validTileSpace(targetTile, game.cities)
            validResources(gameConfig, country)
            validTileOwner(country, targetTile)
            validTileInfluence(gameConfig, country, targetTile)
        }
    }

    fun ValidationContext.validName(name: String) {
        validate("CITY.NAME") {
            name.isNotBlank()
        }
    }

    fun ValidationContext.validTargetTileType(tile: TileEntity) {
        validate("CITY.TARGET_TILE_TYPE") {
            tile.data.terrainType == TileType.LAND.name
        }
    }

    fun ValidationContext.validTileSpace(target: TileEntity, cities: List<CityEntity>) {
        validate("CITY.TILE_SPACE") {
            cities.find { it.tile.tileId == target.key } == null
        }
    }

    fun ValidationContext.validResources(gameConfig: GameConfig, country: CountryEntity) {
        validate("CITY.RESOURCES") {
            country.resources.money >= gameConfig.cityCostMoney
        }
    }

    fun ValidationContext.validTileOwner(country: CountryEntity, target: TileEntity) {
        validate("CITY.TARGET_TILE_OWNER") {
            target.owner == null || target.owner?.countryId == country.key
        }
    }

    fun ValidationContext.validTileInfluence(gameConfig: GameConfig, country: CountryEntity, target: TileEntity) {
        validate("CITY.COUNTRY_INFLUENCE") {
            // country owns tile
            if (target.owner != null && target.owner?.countryId == country.key) {
                return@validate true
            }
            // nobody else has more than 'MAX_TILE_INFLUENCE' influence
            val maxForeignInfluence = target.influences.filter { it.countryId != country.key }.map { it.amount }.max { it } ?: 0.0
            if (maxForeignInfluence < gameConfig.cityTileMaxForeignInfluence) {
                return@validate true
            }
            // country has the most influence on tile
            val maxCountryInfluence = target.influences.filter { it.countryId == country.key }.map { it.amount }.max { it } ?: 0.0
            if (maxCountryInfluence >= maxForeignInfluence) {
                return@validate true
            }
            return@validate false
        }
    }

}