package de.ruegnerlukas.strategygame.backend.external.api.websocket

import de.ruegnerlukas.strategygame.backend.external.api.message.models.Message
import de.ruegnerlukas.strategygame.backend.shared.Json
import de.ruegnerlukas.strategygame.backend.shared.Logging
import io.ktor.websocket.Frame

/**
 * a message-producer sending messages via a websocket
 */
class WebSocketMessageProducer(private val connectionHandler: ConnectionHandler) : MessageProducer, Logging {

	override suspend fun <T> sendToAll(message: Message<T>) {
		log().info("Sending message '${message.type}' to all")
		connectionHandler.getAllConnections().forEach {
			it.session.send(Frame.Text(Json.asString(message)))
		}
	}


	override suspend fun <T> sendToSingle(connectionId: Int, message: Message<T>) {
		log().info("Sending message '${message.type}' to connection $connectionId")
		connectionHandler.getAllConnections()
			.filter { it.getId() == connectionId }
			.forEach { it.session.send(Frame.Text(Json.asString(message))) }
	}


	override suspend fun <T> sendToMultiple(connectionIds: Collection<Int>, message: Message<T>) {
		log().info("Sending message '${message.type}' to connections $connectionIds")
		connectionHandler.getAllConnections()
			.filter { connectionIds.contains(it.getId()) }
			.forEach { it.session.send(Frame.Text(Json.asString(message))) }
	}


	override suspend fun <T> sendToAllExcept(excludedConnectionId: Int, message: Message<T>) {
		log().info("Sending message '${message.type}' to all except connection $excludedConnectionId")
		connectionHandler.getAllConnections()
			.filter { it.getId() != excludedConnectionId }
			.forEach { it.session.send(Frame.Text(Json.asString(message))) }
	}

}