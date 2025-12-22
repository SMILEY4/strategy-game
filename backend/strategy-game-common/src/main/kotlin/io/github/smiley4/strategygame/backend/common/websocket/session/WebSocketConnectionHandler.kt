package io.github.smiley4.strategygame.backend.common.websocket.session

import io.ktor.websocket.DefaultWebSocketSession
import mu.two.KotlinLogging
import java.util.Collections

/**
 * Handler for active websocket-connections
 */
class WebSocketConnectionHandler {

    private val logger = KotlinLogging.logger(WebSocketConnectionHandler::class.java.name)
    private val connections = Collections.synchronizedMap(HashMap<Long, WebSocketConnection>())

    /**
     * Add a new connection
     * @param session the new websocket-session
     * @param data initial data of this websocket connection
     * @return the connection
     */
    fun open(session: DefaultWebSocketSession, data: WebsocketConnectionData): WebSocketConnection {
        val connection = WebSocketConnection(session, data)
        connections[connection.id] = connection
        logger.debug("Added new websocket-connection with id ${connection.id}")
        return connection
    }

    /**
     * Removes the given connection
     * @param connection the connection to close
     */
    fun close(connection: WebSocketConnection) {
        val removed = connections.remove(connection.id) != null
        if (removed) {
            logger.debug("Removed websocket-connection with id ${connection.id}")
        }
    }

    /**
     * @return all currently active connections
     */
    fun getAllConnections(): Set<WebSocketConnection> = connections.values.toMutableSet()

    /**
     * @return the connection with the given id (or null)
     */
    fun getConnection(connectionId: Long) = connections[connectionId]

    /**
     * Send a message to the given connection
     * @param connectionId the id of the connection to send the message to
     * @param content the content of the message
     */
    suspend fun send(connectionId: Long, content: String) {
        connections[connectionId]?.send(content)
    }

    /**
     * Send a message to the given connection
     * @param connectionId the id of the connection to send the message to
     * @param content the content of the message
     */
    suspend fun send(connectionId: Long, content: ByteArray) {
        connections[connectionId]?.send(content)
    }

}
