package io.github.smiley4.strategygame.backend.common.websocket.session

import io.ktor.websocket.DefaultWebSocketSession
import io.ktor.websocket.send
import java.util.concurrent.atomic.AtomicLong

/**
 * A single active websocket connection
 * @param session the ktor websocket session
 */
class WebSocketConnection(
    val session: DefaultWebSocketSession,
    val data: WebsocketConnectionData
) {

    private companion object {
        var lastId = AtomicLong(0)
    }

    /**
     * The id of this connection (unique among the current connections).
     */
    val id: Long = lastId.getAndIncrement()

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
