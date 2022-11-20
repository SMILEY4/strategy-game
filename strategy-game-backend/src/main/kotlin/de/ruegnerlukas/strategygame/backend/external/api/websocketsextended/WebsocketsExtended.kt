package de.ruegnerlukas.strategygame.backend.external.api.websocketsextended

import io.ktor.server.routing.Route
import io.ktor.server.websocket.DefaultWebSocketServerSession
import io.ktor.server.websocket.webSocket

fun Route.webSocketExt(protocol: String? = null, handler: suspend DefaultWebSocketServerSession.() -> Unit) {
    this.webSocket(protocol, handler)
}