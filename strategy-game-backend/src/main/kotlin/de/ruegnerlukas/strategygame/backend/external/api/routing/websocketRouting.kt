package de.ruegnerlukas.strategygame.backend.external.api.routing

import de.ruegnerlukas.strategygame.backend.config.verifyJwt
import de.ruegnerlukas.strategygame.backend.external.api.MessageHandler
import de.ruegnerlukas.strategygame.backend.ports.provided.CloseConnectionAction
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.websocket.ConnectionHandler
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCallPipeline
import io.ktor.server.application.call
import io.ktor.server.request.ApplicationRequest
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.RouteSelector
import io.ktor.server.routing.RouteSelectorEvaluation
import io.ktor.server.routing.RoutingResolveContext
import io.ktor.server.routing.route
import io.ktor.server.websocket.webSocket
import io.ktor.websocket.Frame
import io.ktor.websocket.readText
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json

/**
 * configuration for world-actions
 */
fun Route.websocketRoutes(
	connectionHandler: ConnectionHandler,
	messageHandler: MessageHandler,
	closeConnectionAction: CloseConnectionAction,
) {
	val logger = Logging.create()
	route("messages") {
		interceptWsAuth {
			webSocket {
				val connectionId = connectionHandler.openSession(this)
				try {
					for (frame in incoming) {
						when (frame) {
							is Frame.Text -> messageHandler.onMessage(connectionId, Json.decodeFromString(frame.readText()))
							else -> logger.warn("Unknown frame-type: ${frame.frameType}")
						}
					}
				} finally {
					connectionHandler.closeSession(connectionId)
					closeConnectionAction.perform(connectionId)
				}
			}
		}
	}
}


fun Route.interceptWsAuth(callback: Route.() -> Unit): Route {
	val routeWithAuth = this.createChild(object : RouteSelector() {
		override fun evaluate(context: RoutingResolveContext, segmentIndex: Int): RouteSelectorEvaluation = RouteSelectorEvaluation.Constant
	})
	routeWithAuth.intercept(ApplicationCallPipeline.Plugins) {
		if (!authenticateWebsocket(call.request)) {
			call.respond(HttpStatusCode.Unauthorized)
		}
	}
	callback(routeWithAuth)
	return routeWithAuth
}


fun authenticateWebsocket(request: ApplicationRequest): Boolean {
	val token: String? = request.queryParameters["token"]
	return if (token == null) {
		false
	} else {
		verifyJwt(token)
	}
}