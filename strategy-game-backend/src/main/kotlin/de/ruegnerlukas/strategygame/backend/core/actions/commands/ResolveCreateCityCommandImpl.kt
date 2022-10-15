package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.core.actions.commands.CreateCityValidations.validateCommand
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.shared.RGBColor
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TileOwner
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCreateCityCommand
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

    override suspend fun perform(
        command: Command<CreateCityCommandData>,
        game: GameExtended
    ): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
        log().info("Resolving '${command.data.displayName()}'-command for game ${game.game.gameId} and country ${command.countryId}")
        return either {
            val country = findCountry(command.countryId, game).bind()
            val targetTile = findTile(command.data.q, command.data.r, game).bind()
            validateCommand(gameConfig, command.data.name, game, country, targetTile).ifInvalid<Unit> { reasons ->
                return@either reasons.map { CommandResolutionError(command, it) }
            }
            val cityId = createCity(game, country.countryId, targetTile, command.data.name)
            switchTileCityOwner(game, country.countryId, cityId, targetTile)
            updateCountryResources(country)
            emptyList()
        }
    }


    private fun findCountry(countryId: String, state: GameExtended): Either<ResolveCommandsActionError, Country> {
        val country = state.countries.find { it.countryId == countryId }
        if (country == null) {
            return ResolveCommandsAction.CountryNotFoundError.left()
        } else {
            return country.right()
        }
    }


    private fun findTile(q: Int, r: Int, state: GameExtended): Either<ResolveCommandsActionError, Tile> {
        val targetTile = state.tiles.find { it.position.q == q && it.position.r == r }
        if (targetTile == null) {
            return ResolveCommandsAction.TileNotFoundError.left()
        } else {
            return targetTile.right()
        }
    }


    private suspend fun createCity(game: GameExtended, countryId: String, tile: Tile, name: String): String {
        return City(
            cityId = reservationInsert.reserveCity(),
            gameId = tile.gameId,
            countryId = countryId,
            tile = TileRef(tile.tileId, tile.position.q, tile.position.r),
            name = name,
            color = RGBColor.random(),
            city = true,
            parentCity = null,
            buildings = mutableListOf(),
        ).also { game.cities.add(it) }.cityId
    }


    private fun switchTileCityOwner(game: GameExtended, countryId: String, cityId: String, targetTile: Tile) {
        positionsCircle(targetTile.position, 1) { q, r ->
            game.tiles.find { it.position.q == q && it.position.r == r }?.let { tile ->
                val otherCity = game.cities.find { it.tile.tileId == tile.tileId }
                if (tile.owner?.countryId == countryId && !(otherCity != null && otherCity.city)) {
                    tile.owner = TileOwner(countryId, cityId)
                    otherCity?.parentCity = cityId
                }
            }
        }
    }


    private fun updateCountryResources(country: Country) {
        country.resources.money -= gameConfig.cityCostMoney
    }

}


private object CreateCityValidations {

    fun validateCommand(
        gameConfig: GameConfig,
        name: String,
        game: GameExtended,
        country: Country,
        targetTile: Tile
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

    fun ValidationContext.validTileOwner(country: Country, target: Tile) {
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