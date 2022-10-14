package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.core.actions.commands.CreateTownValidations.validateCommand
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.RGBColor
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.CreateTownCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCreateTownCommand
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.ReservationInsert
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.validation.ValidationContext
import de.ruegnerlukas.strategygame.backend.shared.validation.validations

class ResolveCreateTownCommandImpl(
    private val reservationInsert: ReservationInsert,
    private val gameConfig: GameConfig,
) : ResolveCreateTownCommand, Logging {

    override suspend fun perform(
        command: Command<CreateTownCommandData>,
        game: GameExtended
    ): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
        log().info("Resolving 'create-town'-command for game ${game.game.key} and country ${command.countryId}")
        return either {
            val country = findCountry(command.countryId, game).bind()
            val targetTile = findTile(command.data.q, command.data.r, game).bind()
            validateCommand(gameConfig, command.data.name, game, country, targetTile, command.data.parentCity).ifInvalid<Unit> { reasons ->
                return@either reasons.map { CommandResolutionError(command, it) }
            }
            createTown(game, country.getKeyOrThrow(), command.data.parentCity, targetTile, command.data.name)
            updateCountryResources(country)
            emptyList()
        }
    }


    private fun findCountry(countryId: String, state: GameExtended): Either<ResolveCommandsActionError, Country> {
        val country = state.countries.find { it.key == countryId }
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


    private suspend fun createTown(game: GameExtended, countryId: String, parentCity: String, tile: Tile, name: String) {
        City(
            gameId = tile.gameId,
            countryId = countryId,
            tile = TileRef(tile.getKeyOrThrow(), tile.position.q, tile.position.r),
            name = name,
            color = RGBColor.random(),
            city = false,
            parentCity = parentCity,
            buildings = mutableListOf(),
            key = reservationInsert.reserveCity()
        ).also { game.cities.add(it) }
    }


    private fun updateCountryResources(country: Country) {
        country.resources.money -= gameConfig.townCostMoney
    }

}

private object CreateTownValidations {

    fun validateCommand(
        gameConfig: GameConfig,
        name: String,
        game: GameExtended,
        country: Country,
        targetTile: Tile,
        parentCity: String
    ): ValidationContext {
        return validations(false) {
            validName(name)
            validTargetTileType(targetTile)
            validTileSpace(targetTile, game.cities)
            validResources(gameConfig, country)
            validTileOwner(country, targetTile, parentCity)
        }
    }

    fun ValidationContext.validName(name: String) {
        validate("TOWN.NAME") {
            name.isNotBlank()
        }
    }

    fun ValidationContext.validTargetTileType(tile: Tile) {
        validate("TOWN.TARGET_TILE_TYPE") {
            tile.data.terrainType == TileType.LAND.name
        }
    }

    fun ValidationContext.validTileSpace(target: Tile, cities: List<City>) {
        validate("TOWN.TILE_SPACE") {
            cities.find { it.tile.tileId == target.key } == null
        }
    }

    fun ValidationContext.validResources(gameConfig: GameConfig, country: Country) {
        validate("TOWN.RESOURCES") {
            country.resources.money >= gameConfig.townCostMoney
        }
    }

    fun ValidationContext.validTileOwner(country: Country, target: Tile, parentCity: String) {
        validate("TOWN.TARGET_TILE_OWNER") {
            target.owner?.countryId == country.key && target.owner?.cityId == parentCity
        }
    }

}