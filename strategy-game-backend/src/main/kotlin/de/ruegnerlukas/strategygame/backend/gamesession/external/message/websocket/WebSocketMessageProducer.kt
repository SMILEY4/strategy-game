package de.ruegnerlukas.strategygame.backend.gamesession.external.message.websocket

import de.ruegnerlukas.strategygame.backend.gamesession.external.message.models.Message
import de.ruegnerlukas.strategygame.backend.common.Json
import de.ruegnerlukas.strategygame.backend.common.Logging
import io.github.smiley4.ktorwebsocketsextended.session.WebSocketConnectionHandler

/**
 * a message-producer sending messages via a websocket
 */
class WebSocketMessageProducer(private val connectionHandler: WebSocketConnectionHandler) : MessageProducer, Logging {

    override suspend fun <T> sendToAll(message: Message<T>) {
        log().info("Sending message '${message.type}' to all")
        val jsonMsg = Json.asString(message)
        connectionHandler.getAllConnections().forEach {
            it.send(jsonMsg)
        }
    }

    override suspend fun <T> sendToSingle(connectionId: Long, message: Message<T>) {
        log().info("Sending message '${message.type}' to connection $connectionId")
        val jsonMsg = Json.asString(message)
        connectionHandler.getAllConnections()
            .filter { it.getId() == connectionId }
            .forEach { it.send(jsonMsg) }
    }

    override suspend fun <T> sendToMultiple(connectionIds: Collection<Long>, message: Message<T>) {
        log().info("Sending message '${message.type}' to connections $connectionIds")
        val jsonMsg = Json.asString(message)
        connectionHandler.getAllConnections()
            .filter { connectionIds.contains(it.getId()) }
            .forEach { it.send(jsonMsg) }
    }

    override suspend fun <T> sendToAllExcept(excludedConnectionId: Long, message: Message<T>) {
        log().info("Sending message '${message.type}' to all except connection $excludedConnectionId")
        val jsonMsg = Json.asString(message)
        connectionHandler.getAllConnections()
            .filter { it.getId() != excludedConnectionId }
            .forEach { it.send(jsonMsg) }
    }

}