package de.ruegnerlukas.strategygame.backend.core.actions.turn

import arrow.core.Either
import arrow.core.computations.either
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl.gameId
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity.Companion.CreateCityCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity.Companion.PlaceMarkerCommandData
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.WorldExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.CreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.ResolveCommandsAction.ResolveCommandsActionError
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.ResolveCommandsAction.WorldNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.InsertCity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.InsertMarker
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryWorldExtended
import de.ruegnerlukas.strategygame.backend.shared.Base64
import de.ruegnerlukas.strategygame.backend.shared.Json
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.UUID

class ResolveCommandsActionImpl(
	private val queryWorldExtended: QueryWorldExtended,
	private val insertMarker: InsertMarker,
	private val insertCity: InsertCity
) : ResolveCommandsAction, Logging {

	override suspend fun perform(worldId: String, commands: List<CommandEntity>): Either<ResolveCommandsActionError, Unit> {
		log().info("Resolving ${commands.size} commands for game $gameId")
		return either {
			val world = findCompleteWorld(worldId).bind()
			resolveCommands(world, commands)
		}
	}


	/**
	 * Find and return all data about a world or [WorldNotFoundError] if the world does not exist
	 */
	private suspend fun findCompleteWorld(worldId: String): Either<WorldNotFoundError, WorldExtendedEntity> {
		return queryWorldExtended.execute(worldId).mapLeft { WorldNotFoundError }
	}


	/**
	 * Apply all given commands to the given world (saved to db)
	 */
	private suspend fun resolveCommands(world: WorldExtendedEntity, commands: List<CommandEntity>) {
		commands.forEach { resolveCommand(world, it) }
	}


	/**
	 * Apply the given command to the given world (saved to db)
	 */
	private suspend fun resolveCommand(world: WorldExtendedEntity, command: CommandEntity) {
		when (command.type) {
			PlaceMarkerCommand.TYPE -> resolvePlaceMarkerCommand(world, command)
			CreateCityCommand.TYPE -> resolveCreateCityCommand(world, command)
		}
	}


	private suspend fun resolvePlaceMarkerCommand(world: WorldExtendedEntity, command: CommandEntity) {
		val data: PlaceMarkerCommandData = Json.fromString(Base64.fromBase64(command.data))
		val marker = MarkerEntity(
			id = UUID.gen(),
			playerId = command.playerId,
			tileId = findTile(world, data.q, data.r).id
		)
		insertMarker.execute(marker)
	}


	private suspend fun resolveCreateCityCommand(world: WorldExtendedEntity, command: CommandEntity) {
		val data: CreateCityCommandData = Json.fromString(Base64.fromBase64(command.data))
		/*
		 * TODO:
		 *
		 *  - validate target position
		 * 		- valid tile type for city
		 * 		- tile is empty (no other city)
		 * 		- is far enough away from other cities
		 * - save city to db
		 * - remove resources from country
		 */
		val city = CityEntity(
			id = UUID.gen(),
			tileId = findTile(world, data.q, data.r).id,
		)
		insertCity.execute(city)
	}


	/**
	 * Find and return the tile from the world at the given position or throw an exception
	 */
	private fun findTile(world: WorldExtendedEntity, q: Int, r: Int): TileEntity {
		return world.tiles.find { it.q == q && it.r == r } ?: throw Exception("Could not find tile at $q,$r in world ${world.id}")
	}

}