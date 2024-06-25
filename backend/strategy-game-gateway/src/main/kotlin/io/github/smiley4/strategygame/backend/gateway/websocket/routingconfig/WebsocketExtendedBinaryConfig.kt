package io.github.smiley4.strategygame.backend.gateway.websocket.routingconfig

import io.github.smiley4.strategygame.backend.gateway.websocket.session.WebSocketConnection


typealias BinaryOnEachHandler = suspend (connection: WebSocketConnection, message: ByteArray) -> Unit

/**
 * Configuration for a message handler in binary format
 */
class WebsocketExtendedBinaryConfig {

    var onEachHandler: BinaryOnEachHandler? = null

    fun onEach(handler: BinaryOnEachHandler) {
        this.onEachHandler = handler
    }

}