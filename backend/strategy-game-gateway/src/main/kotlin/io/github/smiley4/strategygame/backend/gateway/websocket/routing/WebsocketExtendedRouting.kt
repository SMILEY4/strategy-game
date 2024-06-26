package io.github.smiley4.strategygame.backend.gateway.websocket.routing

import io.github.smiley4.strategygame.backend.gateway.websocket.auth.WebsocketTicketAuthManager
import io.github.smiley4.strategygame.backend.gateway.websocket.routingconfig.WebsocketExtendedRouteConfig
import io.github.smiley4.strategygame.backend.gateway.websocket.session.WebSocketConnectionHandler
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.ApplicationCallPipeline
import io.ktor.server.application.call
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.RouteSelector
import io.ktor.server.routing.RouteSelectorEvaluation
import io.ktor.server.routing.RoutingResolveContext
import io.ktor.server.routing.get
import io.ktor.server.websocket.webSocket
import io.ktor.util.pipeline.PipelineContext
import java.util.Collections

/**
 * Creates a route providing tickets for authenticating websocket-connections.
 */
internal fun Route.webSocketTicket(ticketManager: WebsocketTicketAuthManager, ticketDataBuilder: (call: ApplicationCall) -> Map<String, Any?>) {
    get {
        val additionalData = ticketDataBuilder(call)
        call.respondText(ticketManager.generateTicket(additionalData))
    }
}

/**
 * See [webSocket]
 */
internal fun Route.webSocketExt(
    connectionHandler: WebSocketConnectionHandler,
    ticketManager: WebsocketTicketAuthManager? = null,
    protocol: String? = null,
    authenticate: Boolean = false,
    config: WebsocketExtendedRouteConfig.() -> Unit
) {
    val handler = WebsocketExtendedHandler(WebsocketExtendedRouteConfig().apply(config), connectionHandler)
    val callDataCache = Collections.synchronizedMap(mutableMapOf<ApplicationCall, MutableMap<String, Any?>>())
    interceptWebsocketRequest(
        interceptor = {
            callDataCache[call] = handler.handleBefore(ticketManager, call, authenticate)
        },
        callback = {
            webSocket(protocol) {
                val data = callDataCache.getOrDefault(this.call, mapOf())
                handler.handleSession(this, data)
            }
        }
    )
}

/**
 * See [webSocket]
 */
internal fun Route.webSocketExt(
    path: String,
    connectionHandler: WebSocketConnectionHandler,
    ticketManager: WebsocketTicketAuthManager? = null,
    protocol: String? = null,
    authenticate: Boolean = false,
    config: WebsocketExtendedRouteConfig.() -> Unit
) {
    val handler = WebsocketExtendedHandler(WebsocketExtendedRouteConfig().apply(config), connectionHandler)
    val callDataCache = Collections.synchronizedMap(mutableMapOf<ApplicationCall, MutableMap<String, Any?>>())
    interceptWebsocketRequest(
        interceptor = {
            callDataCache[call] = handler.handleBefore(ticketManager, call, authenticate)
        },
        callback = {
            webSocket(path, protocol) {
                val data = callDataCache.getOrDefault(this.call, mapOf())
                handler.handleSession(this, data)
            }
        }
    )
}

/**
 * Intercept a websocket-request before a proper connection is established
 */
private fun Route.interceptWebsocketRequest(interceptor: suspend PipelineContext<Unit, ApplicationCall>.() -> Unit, callback: Route.() -> Unit): Route {
    val route = createChild(object : RouteSelector() {
        override fun toString() = ""
        override fun evaluate(context: RoutingResolveContext, segmentIndex: Int) = RouteSelectorEvaluation.Constant
    })
    route.intercept(ApplicationCallPipeline.Plugins) {
        interceptor()
    }
    callback(route)
    return route
}
