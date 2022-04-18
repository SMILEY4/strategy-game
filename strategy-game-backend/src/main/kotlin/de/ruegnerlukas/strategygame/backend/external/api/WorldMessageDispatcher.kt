package de.ruegnerlukas.strategygame.backend.external.api

import de.ruegnerlukas.strategygame.backend.core.ports.models.JoinWorldData
import de.ruegnerlukas.strategygame.backend.core.ports.provided.WorldMessageHandler
import de.ruegnerlukas.strategygame.backend.external.api.wscore.WebSocketMessage
import de.ruegnerlukas.strategygame.backend.shared.Logging
import io.ktor.websocket.readText
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json

/**
 * Dispatcher for world-related messages
 */
class WorldMessageDispatcher(private val worldMessageHandler: WorldMessageHandler) : Logging {

	/**
	 * Called for any incoming message
	 * @param connectionId the id of the connection sending the message
	 * @param strMessage the message as a string
	 */
	suspend fun onMessage(connectionId: Int, strMessage: String) {
		val message = Json.decodeFromString<WebSocketMessage>(strMessage)
		log().info("Received message '${message.type}' from connection $connectionId")
		when (message.type) {
			"join-world" -> handleJoinWorld(connectionId, message.payload)
			else -> {
				log().info("Unknown message type: ${message.type}")
			}
		}
	}


	private suspend fun handleJoinWorld(connectionId: Int, strPayload: String) {
		val payload = Json.decodeFromString<JoinWorldData>(strPayload)
		worldMessageHandler.handleJoinWorld(connectionId, payload)
	}

}