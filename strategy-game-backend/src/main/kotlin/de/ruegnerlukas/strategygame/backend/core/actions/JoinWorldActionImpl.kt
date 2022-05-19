package de.ruegnerlukas.strategygame.backend.core.actions

import de.ruegnerlukas.strategygame.backend.ports.provided.JoinWorldAction
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.ports.required.GenericMessageProducer
import de.ruegnerlukas.strategygame.backend.shared.Logging
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class JoinWorldActionImpl(
	private val messageProducer: GenericMessageProducer,
	private val repository: GameRepository
) : JoinWorldAction, Logging {

	override suspend fun perform(userId: String, connectionId: Int, gameId: String) {
		repository.getGameState(gameId)
			.onSuccess { state ->
				state.participants.find { it.userId == userId }?.connectionId = connectionId
				messageProducer.sendToSingle(connectionId, "world-state", Json.encodeToString(state.map))
				log().info("Player $userId (connectionId=$connectionId) joined world $gameId")
			}
			.onError {
				log().warn("Cant join world that does not exist ($gameId)")
			}
	}


}