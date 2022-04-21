package de.ruegnerlukas.strategygame.backend.core.service.world

import de.ruegnerlukas.strategygame.backend.core.ports.models.WorldMeta
import de.ruegnerlukas.strategygame.backend.core.ports.models.WorldState
import de.ruegnerlukas.strategygame.backend.core.ports.provided.WorldMessageHandler
import de.ruegnerlukas.strategygame.backend.core.ports.provided.WorldService
import de.ruegnerlukas.strategygame.backend.core.ports.required.GenericMessageProducer
import de.ruegnerlukas.strategygame.backend.core.ports.required.WorldRepository
import de.ruegnerlukas.strategygame.backend.core.service.world.tilemap.TilemapBuilder
import de.ruegnerlukas.strategygame.backend.external.api.models.NewTurnData
import de.ruegnerlukas.strategygame.backend.external.api.models.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.external.api.models.PlayerMarker
import de.ruegnerlukas.strategygame.backend.shared.Logging
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.util.UUID

/**
 * Implementation of a [WorldService] and [WorldMessageHandler]
 */
class WorldServiceImpl(
	private val messageProducer: GenericMessageProducer,
	private val worldRepository: WorldRepository
) : Logging, WorldService, WorldMessageHandler {

	override suspend fun handleJoinWorld(connectionId: Int, playerName: String, worldId: String) {
		val state = WorldState(worldRepository.getTilemap(worldId).getOrThrow())
		worldRepository.addParticipant(worldId, connectionId, playerName)
		messageProducer.sendToSingle(connectionId, "world-state", Json.encodeToString(state))
	}


	override suspend fun handleCloseConnection(connectionId: Int) {
		worldRepository.removeParticipant(connectionId)
		worldRepository.getWorldsByParticipant(connectionId).forEach { worldId ->
			if (worldRepository.countPlayingParticipants(worldId).getOrThrow() == 0) {
				endTurn(worldId)
			}
		}
	}


	override suspend fun handleSubmitTurn(connectionId: Int, worldId: String, commands: List<PlaceMarkerCommand>) {
		worldRepository.endPlayerTurn(worldId, connectionId, commands)
		if (worldRepository.countPlayingParticipants(worldId).getOrThrow() == 0) {
			endTurn(worldId)
		}
	}


	private suspend fun endTurn(worldId: String) {
		worldRepository.setAllParticipantsPlaying(worldId)
		val commands = worldRepository.getCommands(worldId)
		val newTurnData = buildNewTurnData(commands)
		worldRepository.getParticipantConnections(worldId).getOrThrow().forEach {
			messageProducer.sendToSingle(it, "new-turn", Json.encodeToString(newTurnData))
		}
	}


	private fun buildNewTurnData(commands: Map<Int, List<PlaceMarkerCommand>>): NewTurnData {
		val addedMarkers = mutableListOf<PlayerMarker>()
		commands.forEach { entry ->
			entry.value.forEach { cmd ->
				addedMarkers.add(PlayerMarker(cmd.q, cmd.r, entry.key))
			}
		}
		return NewTurnData(addedMarkers)
	}


	override fun createNew(): Result<WorldMeta> {
		val tilemap = TilemapBuilder().build()
		val uuid = UUID.randomUUID()!!.toString()
		worldRepository.saveTilemap(tilemap, uuid)
		log().info("Created new map with id $uuid")
		val worldMeta = WorldMeta(uuid)
		return Result.success(worldMeta)
	}

}