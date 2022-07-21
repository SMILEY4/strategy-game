package de.ruegnerlukas.strategygame.backend.core.actions.commands

import arrow.core.Either
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.changes.InsertMarkerChange
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity.Companion.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.WorldExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.CommandResolutionResult
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolvePlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.shared.Base64
import de.ruegnerlukas.strategygame.backend.shared.Json
import de.ruegnerlukas.strategygame.backend.shared.UUID

class ResolvePlaceMarkerCommandImpl : ResolvePlaceMarkerCommand {

	override suspend fun perform(
		command: CommandEntity,
		world: WorldExtendedEntity
	): Either<ResolveCommandsActionError, CommandResolutionResult> {
		val data: PlaceMarkerCommandData = Json.fromString(Base64.fromBase64(command.data))
		return result(
			MarkerEntity(
				id = UUID.gen(),
				playerId = command.playerId,
				tileId = findTile(world, data.q, data.r).id
			)
		).right()
	}


	/**
	 * Find and return the tile from the world at the given position or throw an exception
	 */
	private fun findTile(world: WorldExtendedEntity, q: Int, r: Int): TileEntity {
		return world.tiles.find { it.q == q && it.r == r } ?: throw Exception("Could not find tile at $q,$r in world ${world.id}")
	}


	/**
	 * Build the result object with the given marker in a [InsertMarkerChange]
	 */
	private fun result(marker: MarkerEntity): CommandResolutionResult {
		return CommandResolutionResult(
			changes = listOf(InsertMarkerChange(marker)),
			errors = mapOf()
		)
	}

}