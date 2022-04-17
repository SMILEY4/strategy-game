package de.ruegnerlukas.strategygame.backend.external.api

import de.ruegnerlukas.strategygame.backend.core.ports.models.JoinWorldPayload
import de.ruegnerlukas.strategygame.backend.core.ports.provided.WorldMessageHandler
import de.ruegnerlukas.strategygame.backend.external.api.wscore.WebSocketMessage
import de.ruegnerlukas.strategygame.backend.shared.Logging
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json

class WorldMessageDispatcher(private val worldMessageHandler: WorldMessageHandler) : Logging {

	suspend fun onMessage(connectionId: Int, message: WebSocketMessage) {
		log().info("Received message '${message.type}' from connection $connectionId")
		when (message.type) {
			"join-world" -> handleJoinWorld(connectionId, message.payload)
			else -> {
				log().info("Unknown message type: ${message.type}")
			}
		}
	}


	private suspend fun handleJoinWorld(connectionId: Int, strPayload: String) {
		val payload = Json.decodeFromString<JoinWorldPayload>(strPayload)
		worldMessageHandler.handleJoinWorld(connectionId, payload)
	}

}