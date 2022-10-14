package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.core.actions.commands.PlaceMarkerValidations.validateCommand
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.Command
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.MarkerTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolvePlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.validation.ValidationContext
import de.ruegnerlukas.strategygame.backend.shared.validation.validations

class ResolvePlaceMarkerCommandImpl : ResolvePlaceMarkerCommand, Logging {

    override suspend fun perform(
        command: Command<PlaceMarkerCommandData>,
        game: GameExtended
    ): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
        log().info("Resolving 'place-marker'-command for game ${game.game.key} and country ${command.countryId}")
        return either {
            val targetTile = findTile(command.data.q, command.data.r, game).bind()
            validateCommand(targetTile).ifInvalid<Unit> { reasons ->
                return@either reasons.map { CommandResolutionError(command, it) }
            }
            addMarker(targetTile, command.countryId)
            emptyList()
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


    private fun addMarker(tile: Tile, countryId: String) {
        tile.content.add(MarkerTileContent(countryId))
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
            tile.content.none { it.type == MarkerTileContent.TYPE }
        }
    }

}