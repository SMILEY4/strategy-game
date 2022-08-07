package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerTileContentEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlaceMarkerCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolvePlaceMarkerCommand

class ResolvePlaceMarkerCommandImpl : ResolvePlaceMarkerCommand {

	override suspend fun perform(
		command: CommandEntity<PlaceMarkerCommandDataEntity>,
		state: GameExtendedEntity
	): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
		return either {

			val targetTile = findTile(command.data.q, command.data.r, state).bind()

			val validationErrors = mutableListOf<String>().apply {
				addAll(validateFreeTile(targetTile))
			}

			if (validationErrors.isEmpty()) {
				targetTile.content.add(MarkerTileContentEntity(command.countryId))
				emptyList()
			} else {
				validationErrors.map { CommandResolutionError(command, it) }
			}
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

	private fun validateFreeTile(tile: TileEntity): List<String> {
		val alreadyHasMarker = tile.content.any { it.type == MarkerTileContentEntity.TYPE }
		if (alreadyHasMarker) {
			return listOf("already another marker at position")
		} else {
			return emptyList()
		}
	}

}