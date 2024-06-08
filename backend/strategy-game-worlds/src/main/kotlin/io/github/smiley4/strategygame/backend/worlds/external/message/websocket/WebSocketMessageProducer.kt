package io.github.smiley4.strategygame.backend.worlds.external.message.websocket

import io.github.smiley4.ktorwebsocketsextended.session.WebSocketConnectionHandler
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.worlds.external.message.models.Message

/**
 * a message-producer sending messages via a websocket
 */
class WebSocketMessageProducer(private val connectionHandler: WebSocketConnectionHandler) : MessageProducer, Logging {

    override suspend fun <T> sendToAll(message: Message<T>) {
        log().info("Sending message '${message.type}' to all")
        val encoded = message.encode()
        connectionHandler.getAllConnections().forEach {
            it.send(encoded)
        }
    }

    override suspend fun <T> sendToSingle(connectionId: Long, message: Message<T>) {
        log().info("Sending message '${message.type}' to connection $connectionId")
        val encoded = message.encode()
        connectionHandler.getAllConnections()
            .filter { it.getId() == connectionId }
            .forEach { it.send(encoded) }
    }

    override suspend fun <T> sendToMultiple(connectionIds: Collection<Long>, message: Message<T>) {
        log().info("Sending message '${message.type}' to connections $connectionIds")
        val encoded = message.encode()
        connectionHandler.getAllConnections()
            .filter { connectionIds.contains(it.getId()) }
            .forEach { it.send(encoded) }
    }

    override suspend fun <T> sendToAllExcept(excludedConnectionId: Long, message: Message<T>) {
        log().info("Sending message '${message.type}' to all except connection $excludedConnectionId")
        val encoded = message.encode()
        connectionHandler.getAllConnections()
            .filter { it.getId() != excludedConnectionId }
            .forEach { it.send(encoded) }
    }

}