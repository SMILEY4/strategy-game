package de.ruegnerlukas.strategygame.backend.core.actions

import de.ruegnerlukas.strategygame.backend.ports.models.game.GameState
import de.ruegnerlukas.strategygame.backend.ports.models.game.Marker
import de.ruegnerlukas.strategygame.backend.ports.models.messages.WorldStateMessage
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.ports.required.MessageProducer
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class EndTurnAction(
	private val messageProducer: MessageProducer,
	private val repository: GameRepository
) {

	suspend fun perform(worldId: String) {
		repository.getGameState(worldId).get().let { gameState ->
			gameState.markers = collectAllMarkers(gameState)
			gameState.participants.forEach { it.currentCommands = null }
			sendWorldStateMessage(gameState)
		}
	}

	private fun collectAllMarkers(gameState: GameState): List<Marker> {
		val markers = mutableListOf<Marker>()
		markers.addAll(gameState.markers)
		gameState.participants
			.filter { it.connectionId != null }
			.filter { it.currentCommands != null }
			.forEach { participant ->
				markers.addAll(participant.currentCommands!!.map { Marker(it.q, it.r, participant.userId) })
			}
		return markers
	}

	private suspend fun sendWorldStateMessage(gameState: GameState) {
		val worldStateMessage = WorldStateMessage(gameState.map, gameState.markers)
		gameState.participants
			.filter { it.connectionId != null }
			.map { it.connectionId }
			.forEach { connectionId ->
				messageProducer.sendToSingle(connectionId!!, "world-state", Json.encodeToString(worldStateMessage))
			}
	}

}