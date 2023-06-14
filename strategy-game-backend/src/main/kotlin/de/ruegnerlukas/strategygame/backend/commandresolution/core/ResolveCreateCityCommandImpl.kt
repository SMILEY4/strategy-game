package de.ruegnerlukas.strategygame.backend.commandresolution.core

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.Command
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolveCreateCityCommand
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.required.CreateCityAction
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.City
import de.ruegnerlukas.strategygame.backend.common.models.Country
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.models.TileType
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService
import de.ruegnerlukas.strategygame.backend.common.utils.max
import de.ruegnerlukas.strategygame.backend.common.utils.ValidationContext
import de.ruegnerlukas.strategygame.backend.common.utils.validations

class ResolveCreateCityCommandImpl(
    private val gameConfig: GameConfig,
    private val createCityAction: CreateCityAction,
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
                CreateCityValidations.validateCommand(
                    gameConfig,
                    cmdData.name,
                    game,
                    country,
                    targetTile,
                    cmdData.withNewProvince
                )
                    .ifInvalid<Unit> { reasons ->
                        return@either reasons.map { CommandResolutionError(command, it) }
                    }
                createCityAction.perform(game, command)
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
            validAvailableSettlers(country)
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
            tile.data.terrainType == TileType.LAND
        }
    }

    fun ValidationContext.validTileSpace(target: Tile, cities: List<City>) {
        validate("CITY.TILE_SPACE") {
            cities.find { it.tile.tileId == target.tileId } == null
        }
    }

    fun ValidationContext.validTileOwnerInExistingProvince(country: Country, target: Tile) {
        validate("CITY.TARGET_TILE_OWNER") {
            target.owner?.countryId == country.countryId && target.owner?.cityId == null
        }
    }

    fun ValidationContext.validTileOwnerWithNewProvince(country: Country, target: Tile) {
        validate("CITY.TARGET_TILE_OWNER") {
            (target.owner == null || target.owner?.countryId == country.countryId) && target.owner?.cityId == null
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

    fun ValidationContext.validAvailableSettlers(country: Country) {
        validate("CITY.AVAILABLE_SETTLERS") {
            country.availableSettlers > 0
        }
    }

}