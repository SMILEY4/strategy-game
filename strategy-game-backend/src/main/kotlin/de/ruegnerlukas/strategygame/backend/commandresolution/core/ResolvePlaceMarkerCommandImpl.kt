package de.ruegnerlukas.strategygame.backend.commandresolution.core

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.commandresolution.core.PlaceMarkerValidations.validateCommand
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.Command
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.models.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.provided.ResolvePlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.commandresolution.ports.required.PlaceMarkerAction
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.models.MarkerTileContent
import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.common.utils.ValidationContext
import de.ruegnerlukas.strategygame.backend.common.utils.validations

class ResolvePlaceMarkerCommandImpl(
    private val placeMarkerAction: PlaceMarkerAction,
) : ResolvePlaceMarkerCommand, Logging {

    private val metricId = metricCoreAction(ResolvePlaceMarkerCommand::class)

    override suspend fun perform(
        command: Command<PlaceMarkerCommandData>,
        game: GameExtended
    ): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
        return Monitoring.coTime(metricId) {
            log().info("Resolving '${command.data.displayName()}'-command for game ${game.game.gameId} and country ${command.countryId}")
            either {
                val targetTile = findTile(command.data.q, command.data.r, game).bind()
                validateCommand(targetTile).ifInvalid<Unit> { reasons ->
                    return@either reasons.map { CommandResolutionError(command, it) }
                }
                placeMarkerAction.performPlaceMarker(game, command)
                emptyList()
            }
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

}

private object PlaceMarkerValidations {

    fun validateCommand(targetTile: Tile): ValidationContext {
        return validations(false) {
            validTileSpace(targetTile)
        }
    }

    fun ValidationContext.validTileSpace(tile: Tile) {
        validate("MARKER.TILE_SPACE") {
            tile.content.none { it is MarkerTileContent }
        }
    }

}