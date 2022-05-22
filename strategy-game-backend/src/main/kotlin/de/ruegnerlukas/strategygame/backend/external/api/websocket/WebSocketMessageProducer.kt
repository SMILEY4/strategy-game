package de.ruegnerlukas.strategygame.backend.external.api.websocket

import de.ruegnerlukas.strategygame.backend.shared.Logging
import io.ktor.websocket.Frame
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/**
 * a message-producer sending messages via a websocket
 */
class WebSocketMessageProducer(private val connectionHandler: ConnectionHandler) : MessageProducer, Logging {

	override suspend fun sendToAll(type: String, payload: String) {
		log().info("Sending message '$type' to all")
		val message = buildMessageString(type, payload)
		connectionHandler.getAllConnections().forEach {
			it.session.send(Frame.Text(message))
		}
	}


	override suspend fun sendToSingle(connectionId: Int, type: String, payload: String) {
		log().info("Sending message '$type' to connection $connectionId")
		val message = buildMessageString(type, payload)
		connectionHandler.getAllConnections()
			.filter { it.getId() == connectionId }
			.forEach { it.session.send(Frame.Text(message)) }
	}


	override suspend fun sendToMultiple(connectionIds: Collection<Int>, type: String, payload: String) {
		log().info("Sending message '$type' to connections $connectionIds")
		val message = buildMessageString(type, payload)
		connectionHandler.getAllConnections()
			.filter { connectionIds.contains(it.getId()) }
			.forEach { it.session.send(Frame.Text(message)) }
	}


	override suspend fun sendToAllExcept(excludedConnectionId: Int, type: String, payload: String) {
		log().info("Sending message '$type' to all except connection $excludedConnectionId")
		val message = buildMessageString(type, payload)
		connectionHandler.getAllConnections()
			.filter { it.getId() != excludedConnectionId }
			.forEach { it.session.send(Frame.Text(message)) }
	}


	/**
	 * @param type the type of the message
	 * @param payload the payload of the message as a string
	 * @return the message as a (json-) string
	 */
	private fun buildMessageString(type: String, payload: String): String {
		return Json.encodeToString(
			mapOf(
				"type" to type,
				"payload" to payload
			)
		)
	}

}