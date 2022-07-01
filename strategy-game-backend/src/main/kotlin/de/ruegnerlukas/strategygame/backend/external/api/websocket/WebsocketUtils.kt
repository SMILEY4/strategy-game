package de.ruegnerlukas.strategygame.backend.external.api.websocket

import de.ruegnerlukas.strategygame.backend.external.api.message.models.Message
import de.ruegnerlukas.strategygame.backend.external.api.message.models.MessageMetadata
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService
import de.ruegnerlukas.strategygame.backend.shared.Json
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.ApplicationCallPipeline
import io.ktor.server.application.call
import io.ktor.server.request.ApplicationRequest
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.RouteSelector
import io.ktor.server.routing.RouteSelectorEvaluation
import io.ktor.server.routing.RoutingResolveContext
import io.ktor.util.pipeline.PipelineContext
import io.ktor.websocket.Frame
import io.ktor.websocket.readText


object WebsocketUtils {

	/**
	 * The name of the query-parameter field for the jwt-token
	 */
	const val QUERY_PARAM_TOKEN = "token"


	/**
	 * The name of the path parameter for the game-id
	 */
	const val PATH_PARAM_GAME_ID = "gameId"


	/**
	 * Intercept a websocket-request before a proper connection is established
	 */
	fun Route.interceptWebsocketRequest(
		interceptor: suspend PipelineContext<Unit, ApplicationCall>.() -> Unit, callback: Route.() -> Unit
	): Route {
		val route = this.createChild(object : RouteSelector() {
			override fun evaluate(context: RoutingResolveContext, segmentIndex: Int) = RouteSelectorEvaluation.Constant
		})
		route.intercept(ApplicationCallPipeline.Plugins) {
			interceptor()
		}
		callback(route)
		return route
	}


	/**
	 * Authenticate a websocket-request before a proper connection is established.
	 * A jwt-token must be provided as a query-parameter with the name [QUERY_PARAM_TOKEN]
	 */
	fun Route.websocketAuthenticate(userClient: UserIdentityService, callback: Route.() -> Unit): Route {
		return interceptWebsocketRequest(
			interceptor = {
				if (!authenticateWebsocket(userClient, call.request)) {
					call.respond(HttpStatusCode.Unauthorized)
				}
			}, callback = callback
		)
	}


	private fun authenticateWebsocket(userClient: UserIdentityService, request: ApplicationRequest): Boolean {
		val token: String? = request.queryParameters[QUERY_PARAM_TOKEN]
		return if (token == null) {
			false
		} else {
			userClient.verifyJwtToken(token)
		}
	}


	fun <T> buildMessage(userService: UserIdentityService, connectionId: Int, call: ApplicationCall, frame: Frame.Text): Message<T> {
		return Json.fromString<Message<T>>(frame.readText()).apply {
			meta = MessageMetadata(
				connectionId,
				userService.extractUserId(call.request.queryParameters[QUERY_PARAM_TOKEN]!!),
				call.parameters[PATH_PARAM_GAME_ID]!!
			)
		}
	}

//	/**
//	 * Build a [WebSocketMessage]-object from the given data
//	 */
//	fun buildMessage(userService: UserIdentityService, connectionId: Int, call: ApplicationCall, frame: Frame.Text): WebSocketMessage {
//		return buildMessage(
//			userService,
//			connectionId,
//			call.request.queryParameters[QUERY_PARAM_TOKEN]!!,
//			call.parameters[PATH_PARAM_GAME_ID]!!,
//			frame.readText()
//		)
//	}
//
//
//	/**
//	 * Build a [WebSocketMessage]-object from the given data
//	 */
//	fun buildMessage(userClient: UserIdentityService, connectionId: Int, token: String, gameId: String, rawData: String): WebSocketMessage {
//		val data = Json.fromString<Map<String, String>>(rawData)
//		return WebSocketMessage(
//			connectionId = connectionId,
//			userId = userClient.extractUserId(token),
//			gameId = gameId,
//			type = data["type"]!!,
//			payload = data["payload"]!!, // todo: make message safer -> validation + proper error handling
//		)
//	}

}


