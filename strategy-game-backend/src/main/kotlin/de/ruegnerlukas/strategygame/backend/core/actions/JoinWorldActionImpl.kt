package de.ruegnerlukas.strategygame.backend.core.actions

import de.ruegnerlukas.strategygame.backend.ports.models.messages.WorldStateMessage
import de.ruegnerlukas.strategygame.backend.ports.provided.JoinWorldAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.ports.required.MessageProducer
import de.ruegnerlukas.strategygame.backend.shared.Logging
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class JoinWorldActionImpl(
	private val messageProducer: MessageProducer,
	private val repository: GameRepository
) : JoinWorldAction, Logging {

	override suspend fun perform(userId: String, connectionId: Int, gameId: String) {
		repository.getGameState(gameId)
			.onSuccess { state ->
				state.participants.find { it.userId == userId }?.connectionId = connectionId
				val message = WorldStateMessage(state.map, state.markers)
				messageProducer.sendToSingle(connectionId, "world-state", Json.encodeToString(message))
				log().info("Player $userId (connectionId=$connectionId) joined world $gameId")
			}
			.onError {
				log().warn("Cant join world that does not exist ($gameId)")
			}
	}

}