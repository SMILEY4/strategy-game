package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.core.actions.commands.PlaceScoutValidations.validateCommand
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEventManager
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventCommandScoutPlace
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceScoutCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.ScoutTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolvePlaceScoutCommand
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.validation.ValidationContext
import de.ruegnerlukas.strategygame.backend.shared.validation.validations

class ResolvePlaceScoutCommandImpl(
    private val gameConfig: GameConfig,
    private val gameEventManager: GameEventManager,
) : ResolvePlaceScoutCommand, Logging {

    private val metricId = metricCoreAction(ResolvePlaceScoutCommand::class)

    override suspend fun perform(
        command: Command<PlaceScoutCommandData>,
        game: GameExtended
    ): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
        return Monitoring.coTime(metricId) {
            log().info("Resolving '${command.data.displayName()}'-command for game ${game.game.gameId} and country ${command.countryId}")
            either {
                val targetTile = findTile(command.data.q, command.data.r, game).bind()
                validateCommand(gameConfig, command.countryId, targetTile, game).ifInvalid<Unit> { reasons ->
                    return@either reasons.map { CommandResolutionError(command, it) }
                }
                gameEventManager.send(GameEventCommandScoutPlace::class.simpleName!!, GameEventCommandScoutPlace(game, command))
                emptyList()
            }
        }
    }


    private fun findTile(q: Int, r: Int, state: GameExtended): Either<ResolveCommandsActionError, Tile> {
        val targetTile = state.tiles.find { it.position.q == q && it.position.r == r }
        return targetTile?.right() ?: ResolveCommandsAction.TileNotFoundError.left()
    }

}


private object PlaceScoutValidations {

    fun validateCommand(gameConfig: GameConfig, countryId: String, targetTile: Tile, game: GameExtended): ValidationContext {
        return validations(false) {
            validTileVisibility(countryId, targetTile)
            validTileSpace(countryId, targetTile)
            validScoutAmount(gameConfig, countryId, game.tiles)
        }
    }


    fun ValidationContext.validTileVisibility(countryId: String, tile: Tile) {
        validate("SCOUT.TILE_VISIBILITY") {
            tile.discoveredByCountries.contains(countryId)
        }
    }

    fun ValidationContext.validTileSpace(countryId: String, tile: Tile) {
        validate("SCOUT.TILE_SPACE") {
            tile.content
                .filterIsInstance<ScoutTileContent>()
                .none { it.countryId == countryId }
        }
    }

    fun ValidationContext.validScoutAmount(gameConfig: GameConfig, countryId: String, tiles: Collection<Tile>) {
        validate("SCOUT.AMOUNT") {
            tiles
                .asSequence()
                .mapNotNull { tile -> tile.content.find { it is ScoutTileContent }?.let { it as ScoutTileContent } }
                .filter { scout -> scout.countryId == countryId }
                .count() < gameConfig.scoutsMaxAmount
        }
    }

}