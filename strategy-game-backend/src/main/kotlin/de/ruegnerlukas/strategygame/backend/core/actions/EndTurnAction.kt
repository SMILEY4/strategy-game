package de.ruegnerlukas.strategygame.backend.core.actions

import de.ruegnerlukas.strategygame.backend.ports.models.messages.NewTurnMessage
import de.ruegnerlukas.strategygame.backend.ports.models.messages.PlayerMarker
import de.ruegnerlukas.strategygame.backend.ports.models.game.GameParticipant
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
			val newTurnData = buildNewTurnData(gameState.participants)
			gameState.participants
				.filter { it.connectionId != null }
				.map { it.connectionId }
				.forEach { connectionId ->
					messageProducer.sendToSingle(connectionId!!, "new-turn", Json.encodeToString(newTurnData))
				}
			gameState.participants.forEach { it.currentCommands = null }
		}
	}

	private fun buildNewTurnData(participants: List<GameParticipant>): NewTurnMessage {
		val addedMarkers = mutableListOf<PlayerMarker>()
		participants.filter { it.connectionId != null }.forEach { participant ->
			participant.currentCommands?.forEach { cmd ->
				addedMarkers.add(PlayerMarker(cmd.q, cmd.r, participant.connectionId!!))
			}
		}
		return NewTurnMessage(addedMarkers)
	}

}