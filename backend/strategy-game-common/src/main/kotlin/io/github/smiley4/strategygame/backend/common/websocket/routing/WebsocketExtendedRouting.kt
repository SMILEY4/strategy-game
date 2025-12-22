package io.github.smiley4.strategygame.backend.common.websocket.routing

import io.github.smiley4.strategygame.backend.common.websocket.auth.WebsocketTicketAuthManager
import io.github.smiley4.strategygame.backend.common.websocket.routingconfig.WebsocketExtendedRouteConfig
import io.github.smiley4.strategygame.backend.common.websocket.session.WebSocketConnectionHandler
import io.github.smiley4.strategygame.backend.common.websocket.session.WebsocketConnectionData
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.PipelineCall
import io.ktor.server.application.createRouteScopedPlugin
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.websocket.webSocket
import io.ktor.util.AttributeKey

data class TicketResponse(val ticket: String)


/**
 * Creates a route providing tickets for authenticating websocket-connections.
 */
fun Route.webSocketTicket(
    ticketManager: WebsocketTicketAuthManager,
    ticketDataBuilder: (call: ApplicationCall) -> Map<String, Any?>
) {
    get {
        val additionalData = ticketDataBuilder(call)
        call.respond(HttpStatusCode.OK, TicketResponse(ticketManager.generateTicket(additionalData)))
    }
}

private val authDataAttributeKey = AttributeKey<WebsocketConnectionData>("wsext.authdata")


/**
 * See [io.ktor.server.websocket.webSocket]
 */
fun Route.webSocketExt(
    connectionHandler: WebSocketConnectionHandler,
    ticketManager: WebsocketTicketAuthManager? = null,
    protocol: String? = null,
    authenticate: Boolean = false,
    config: WebsocketExtendedRouteConfig.() -> Unit
) {
    val handler = WebsocketExtendedHandler(WebsocketExtendedRouteConfig().apply(config), connectionHandler)
    interceptWebsocketRequest(
        interceptor = { call ->
            handler.handleBefore(ticketManager, call, authenticate)?.also {
                call.attributes.put(authDataAttributeKey, it)
            }
        })
    {
        webSocket(protocol) {
            handler.handleSession(this, call.attributes[authDataAttributeKey])
        }
    }
}


/**
 * See [io.ktor.server.websocket.webSocket]
 */
fun Route.webSocketExt(
    path: String,
    connectionHandler: WebSocketConnectionHandler,
    ticketManager: WebsocketTicketAuthManager? = null,
    protocol: String? = null,
    authenticate: Boolean = false,
    config: WebsocketExtendedRouteConfig.() -> Unit
) {
    val handler = WebsocketExtendedHandler(WebsocketExtendedRouteConfig().apply(config), connectionHandler)
    interceptWebsocketRequest(
        interceptor = { call ->
            handler.handleBefore(ticketManager, call, authenticate)?.also {
                call.attributes.put(authDataAttributeKey, it)
            }
        }
    ) {
        webSocket(path, protocol) {
            handler.handleSession(this, call.attributes[authDataAttributeKey])
        }
    }
}


/**
 * Intercept a websocket-request before a proper connection is established
 */
private fun Route.interceptWebsocketRequest(
    interceptor: suspend (call: PipelineCall) -> Unit,
    handler: Route.() -> Unit
): Route {
    this.install(InterceptWebsocketRequestPlugin) {
        this.interceptor = interceptor
    }
    handler(this)
    return this
}

private class InterceptWebsocketRequestPluginConfig(
    var interceptor: suspend (call: PipelineCall) -> Unit = {}
)

private val InterceptWebsocketRequestPlugin =
    createRouteScopedPlugin(name = "InterceptWebsocketRequestPlugin", createConfiguration = ::InterceptWebsocketRequestPluginConfig) {
        onCallRespond { call, _ ->
            pluginConfig.interceptor.invoke(call)
        }
    }