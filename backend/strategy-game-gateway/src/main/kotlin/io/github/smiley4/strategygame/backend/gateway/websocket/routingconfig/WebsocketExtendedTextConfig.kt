package io.github.smiley4.strategygame.backend.gateway.websocket.routingconfig

import io.github.smiley4.strategygame.backend.gateway.websocket.session.WebSocketConnection

internal typealias TextOnEachHandler = suspend (connection: WebSocketConnection, message: String) -> Unit

/**
 * Configuration for a message handler in text format
 */
internal class WebsocketExtendedTextConfig {

    var onEachHandler: TextOnEachHandler? = null

    fun onEach(handler: TextOnEachHandler) {
        this.onEachHandler = handler
    }

}