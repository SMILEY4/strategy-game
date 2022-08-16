package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlaceMarkerCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolvePlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.shared.Logging

class ResolvePlaceMarkerCommandImpl : ResolvePlaceMarkerCommand, Logging {

	override suspend fun perform(
		command: CommandEntity<PlaceMarkerCommandDataEntity>,
		game: GameExtendedEntity
	): Either<ResolveCommandsActionError, List<CommandResolutionError>> {
		log().info("Resolving 'place-marker'-command for game ${game.game.key} and country ${command.countryId}")
		return either {
			val targetTile = findTile(command.data.q, command.data.r, game).bind()
			val validationErrors = validateCommand(targetTile)
			if (validationErrors.isEmpty()) {
				addMarker(targetTile, command.countryId)
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


	private fun validateCommand(targetTile: TileEntity): List<String> {
		return mutableListOf<String>().apply {
			addAll(validateFreeTile(targetTile))
		}
	}


	private fun validateFreeTile(tile: TileEntity): List<String> {
		val alreadyHasMarker = tile.content.any { it.type == MarkerTileContent.TYPE }
		if (alreadyHasMarker) {
			return listOf("already another marker at position")
		} else {
			return emptyList()
		}
	}


	private fun addMarker(tile: TileEntity, countryId: String) {
		tile.content.add(MarkerTileContent(countryId))
	}

}