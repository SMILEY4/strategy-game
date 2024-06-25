package io.github.smiley4.strategygame.backend.gateway.websocket.session

import io.ktor.websocket.DefaultWebSocketSession
import io.ktor.websocket.send
import java.util.concurrent.atomic.AtomicLong

/**
 * A single active websocket connection
 * @param session the ktor websocket session
 */
class WebSocketConnection(
    private val session: DefaultWebSocketSession,
    private val initialData: Map<String, Any?>
) {

    private val data = mutableMapOf<String, Any?>().also { it.putAll(initialData) }

    private companion object {
        var lastId = AtomicLong(0)
    }

    /**
     * The id of this connection (unique among the current connections).
     */
    private val id: Long = lastId.getAndIncrement()

    /**
     * @return the id of this connection.
     */
    fun getId() = id

    /**
     * @return the session associated with this connection
     */
    fun getSession() = session


    fun <T> setData(key: String, value: T?) {
        data[key] = value
    }

    fun <T> getData(key: String): T? {
        return try {
            @Suppress("UNCHECKED_CAST")
            data[key] as T
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Send a message to this connection
     * @param content the content of the message
     */
    suspend fun send(content: String) {
        session.send(content)
    }

    /**
     * Send a message to this connection
     * @param content the content of the message
     */
    suspend fun send(content: ByteArray) {
        session.send(content)
    }

}
