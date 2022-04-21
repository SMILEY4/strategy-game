package de.ruegnerlukas.strategygame.backend.external.api

import de.ruegnerlukas.strategygame.backend.external.api.models.JoinWorldMessage
import de.ruegnerlukas.strategygame.backend.external.api.models.SubmitTurnMessage
import de.ruegnerlukas.strategygame.backend.core.ports.provided.WorldMessageHandler
import de.ruegnerlukas.strategygame.backend.external.api.websocket.WebSocketMessage
import de.ruegnerlukas.strategygame.backend.shared.Logging
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json

/**
 * Dispatcher for world-related messages
 */
class WorldMessageDispatcher(private val worldMessageHandler: WorldMessageHandler) : Logging {

	/**
	 * Called for any incoming message
	 * @param connectionId the id of the connection sending the message
	 * @param message the message
	 */
	suspend fun onMessage(connectionId: Int, message: WebSocketMessage) {
		log().info("Received message '${message.type}' from connection $connectionId")
		when (message.type) {
			"join-world" -> handleJoinWorld(connectionId, message.payload)
			"submit-turn" -> handleSubmitTurn(connectionId, message.payload)
			else -> log().info("Unknown message type: ${message.type}")
		}
	}


	private suspend fun handleJoinWorld(connectionId: Int, strPayload: String) {
		val payload = Json.decodeFromString<JoinWorldMessage>(strPayload)
		worldMessageHandler.handleJoinWorld(connectionId, payload.playerName, payload.worldId)
	}


	private suspend fun handleSubmitTurn(connectionId: Int, strPayload: String) {
		val payload = Json.decodeFromString<SubmitTurnMessage>(strPayload)
		worldMessageHandler.handleSubmitTurn(connectionId, payload.worldId, payload.commands)
	}

}