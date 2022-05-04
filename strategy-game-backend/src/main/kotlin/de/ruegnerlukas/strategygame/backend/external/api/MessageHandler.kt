package de.ruegnerlukas.strategygame.backend.external.api

import de.ruegnerlukas.strategygame.backend.external.api.models.JoinWorldMessage
import de.ruegnerlukas.strategygame.backend.external.api.models.SubmitTurnMessage
import de.ruegnerlukas.strategygame.backend.ports.provided.JoinWorldAction
import de.ruegnerlukas.strategygame.backend.ports.provided.SubmitTurnAction
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.websocket.WebSocketMessage
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json

/**
 * Dispatcher for world-related messages
 */
class MessageHandler(
	private val joinWorldAction: JoinWorldAction,
	private val submitTurnAction: SubmitTurnAction
) : Logging {

	/**
	 * Called for any incoming message
	 * @param userId the id of the user sending the message
	 * @param connectionId the id of the connection sending the message
	 * @param message the message
	 */
	suspend fun onMessage(userId: String, connectionId: Int, message: WebSocketMessage) {
		log().info("Received message '${message.type}' from connection $connectionId")
		when (message.type) {
			"join-world" -> handleJoinWorld(userId, connectionId, message.payload)
			"submit-turn" -> handleSubmitTurn(userId, connectionId, message.payload)
			else -> log().info("Unknown message type: ${message.type}")
		}
	}

	private suspend fun handleJoinWorld(userId: String, connectionId: Int, strPayload: String) {
		handleMessage<JoinWorldMessage>(strPayload) {
			joinWorldAction.perform(userId, connectionId, it.worldId)
		}
	}


	private suspend fun handleSubmitTurn(userId: String, connectionId: Int, strPayload: String) {
		handleMessage<SubmitTurnMessage>(strPayload) {
			submitTurnAction.perform(userId, connectionId, it.worldId, it.commands)
		}
	}

	private inline fun <reified T> handleMessage(strPayload: String, handler: (payload: T) -> Unit) {
		val payload = Json.decodeFromString<T>(strPayload)
		handler(payload)
	}

}