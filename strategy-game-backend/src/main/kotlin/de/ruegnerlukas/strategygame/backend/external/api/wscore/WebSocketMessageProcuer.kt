package de.ruegnerlukas.strategygame.backend.external.api.wscore

import de.ruegnerlukas.strategygame.backend.core.ports.required.MessageProducer
import de.ruegnerlukas.strategygame.backend.shared.Logging
import io.ktor.util.reflect.instanceOf
import io.ktor.websocket.Frame
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class WebSocketMessageProducer(private val connectionHandler: ConnectionHandler) : MessageProducer, Logging {

	override suspend fun sendToAll(type: String, payload: String) {
		log().info("Sending message '$type' to all")
		val message = buildMessage(type, payload)
		connectionHandler.getAllConnections().forEach {
			it.session.send(Frame.Text(message))
		}
	}


	override suspend fun sendToSingle(connectionId: Int, type: String, payload: String) {
		log().info("Sending message '$type' to connection $connectionId")
		val message = buildMessage(type, payload)
		connectionHandler.getAllConnections()
			.filter { it.id == connectionId }
			.forEach {
				it.session.send(Frame.Text(message))
			}
	}


	override suspend fun sendToExcept(excludedConnectionId: Int, type: String, payload: String) {
		log().info("Sending message '$type' to all except connection $excludedConnectionId")
		val message = buildMessage(type, payload)
		connectionHandler.getAllConnections()
			.filter { it.id != excludedConnectionId }
			.forEach {
				it.session.send(Frame.Text(message))
			}
	}


	private fun buildMessage(type: String, payload: String): String {
		return Json.encodeToString(WebSocketMessage(type, payload))
	}

}