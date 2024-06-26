package io.github.smiley4.strategygame.backend.gateway.websocket.session

internal data class WebSocketMessage(
    val messageIdentifier: String,
    val data: Map<String, Any?>,
    val connectionId: Int
)