package de.ruegnerlukas.strategygame.backend.external.api.websocket

import de.ruegnerlukas.strategygame.backend.external.api.models.JoinWorldMessage
import de.ruegnerlukas.strategygame.backend.external.api.models.SubmitTurnMessage
import de.ruegnerlukas.strategygame.backend.ports.provided.JoinWorldAction
import de.ruegnerlukas.strategygame.backend.ports.provided.SubmitTurnAction
import de.ruegnerlukas.strategygame.backend.shared.Logging
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
	 * @param message the message
	 */
	suspend fun onMessage(message: WebSocketMessage) {
		log().info("Received message '${message.type}' from connection ${message.connectionId}")
		when (message.type) {
			"join-world" -> handleJoinWorld(message)
			"submit-turn" -> handleSubmitTurn(message)
			else -> log().info("Unknown message type: ${message.type}")
		}
	}

	private suspend fun handleJoinWorld(message: WebSocketMessage) {
		handleMessage<JoinWorldMessage>(message.payload) {
			joinWorldAction.perform(message.userId, message.connectionId, it.worldId)
		}
	}

	private suspend fun handleSubmitTurn(message: WebSocketMessage) {
		handleMessage<SubmitTurnMessage>(message.payload) {
			submitTurnAction.perform(message.userId, message.connectionId, it.worldId, it.commands)
		}
	}

	private inline fun <reified T> handleMessage(strPayload: String, handler: (payload: T) -> Unit) {
		val payload = Json.decodeFromString<T>(strPayload)
		handler(payload)
	}

}