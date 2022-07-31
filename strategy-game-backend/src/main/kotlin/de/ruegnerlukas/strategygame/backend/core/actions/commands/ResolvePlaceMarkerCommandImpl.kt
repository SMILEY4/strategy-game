package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity.Companion.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.game.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.gamestate.GameState
import de.ruegnerlukas.strategygame.backend.ports.models.gamestate.MarkerState
import de.ruegnerlukas.strategygame.backend.ports.models.gamestate.TileState
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolvePlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.shared.Base64
import de.ruegnerlukas.strategygame.backend.shared.Json
import de.ruegnerlukas.strategygame.backend.shared.UUID

class ResolvePlaceMarkerCommandImpl : ResolvePlaceMarkerCommand {

	override suspend fun perform(
		command: CommandEntity,
		state: GameState
	): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
		val data: PlaceMarkerCommandData = Json.fromString(Base64.fromBase64(command.data))
		return either {
			val tile = findTile(data, state).bind()

			val validationErrors = mutableListOf<String>().apply {
				addAll(validateFreeTile(state.markers.get(), tile))
			}

			if (validationErrors.isEmpty()) {
				val marker = MarkerState(
					id = UUID.gen(),
					tileId = tile.id,
					q = tile.q,
					r = tile.r,
					playerId = command.playerId
				)
				state.markers.get().add(marker)
				emptyList()
			} else {
				validationErrors.map { CommandResolutionError(command, it) }
			}
		}
	}

	private fun findTile(data: PlaceMarkerCommandData, state: GameState): Either<ResolveCommandsActionError, TileState> {
		val targetTile = state.tiles.find { it.q == data.q && it.r == data.r }
		if (targetTile == null) {
			return ResolveCommandsAction.TileNotFoundError.left()
		} else {
			return targetTile.right()
		}
	}

	private fun validateFreeTile(markers: List<MarkerState>, target: TileState): List<String> {
		if (markers.none { it.tileId == target.id }) {
			return emptyList()
		} else {
			return listOf("already another marker at position")
		}
	}

}