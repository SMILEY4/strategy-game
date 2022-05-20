package de.ruegnerlukas.strategygame.backend.external.api.routing

import de.ruegnerlukas.strategygame.backend.external.api.websocket.ConnectionHandler
import de.ruegnerlukas.strategygame.backend.external.api.websocket.MessageHandler
import de.ruegnerlukas.strategygame.backend.external.api.websocket.WebsocketUtils
import de.ruegnerlukas.strategygame.backend.external.api.websocket.WebsocketUtils.interceptWebsocketRequest
import de.ruegnerlukas.strategygame.backend.external.api.websocket.WebsocketUtils.websocketAuthenticate
import de.ruegnerlukas.strategygame.backend.ports.provided.CloseConnectionAction
import de.ruegnerlukas.strategygame.backend.ports.provided.JoinWorldAction
import de.ruegnerlukas.strategygame.backend.ports.provided.ValidateConnectGameLobbyAction
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService
import de.ruegnerlukas.strategygame.backend.shared.Logging
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import io.ktor.server.websocket.webSocket
import io.ktor.websocket.Frame


/**
 * Configuration for game-websocket routes
 */
fun Route.gameWebsocketRoutes(
	connectionHandler: ConnectionHandler,
	userService: UserIdentityService,
	messageHandler: MessageHandler,
	closeConnectionAction: CloseConnectionAction,
	validateConnectLobbyAction: ValidateConnectGameLobbyAction,
	joinWorldAction: JoinWorldAction
) {
	val logger = Logging.create()
	route("game/{${WebsocketUtils.PATH_PARAM_GAME_ID}}") {
		websocketAuthenticate(userService) {
			interceptWebsocketRequest(
				interceptor = {
					val result = validateConnectLobbyAction.perform(
						userService.extractUserId(call.request.queryParameters[WebsocketUtils.QUERY_PARAM_TOKEN]!!),
						call.parameters[WebsocketUtils.PATH_PARAM_GAME_ID]!!
					)
					when {
						result.isError("NOT_PARTICIPANT") -> call.respond(HttpStatusCode.Conflict, result.getError())
						result.isError() -> call.respond(HttpStatusCode.InternalServerError, result.getError())
					}
				},
				callback = {
					webSocket {
						val connectionId = connectionHandler.openSession(this)
						joinWorldAction.perform(
							getWebsocketUserIdOrThrow(userService, call),
							connectionId,
							call.parameters[WebsocketUtils.PATH_PARAM_GAME_ID]!!
						)
						try {
							for (frame in incoming) {
								when (frame) {
									is Frame.Text -> WebsocketUtils.buildMessage(userService, connectionId, call, frame).let {
										messageHandler.onMessage(it)
									}
									else -> logger.warn("Unknown frame-type: ${frame.frameType}")
								}
							}
						} finally {
							connectionHandler.closeSession(connectionId)
							closeConnectionAction.perform(getWebsocketUserIdOrThrow(userService, call))
						}
					}
				}
			)
		}
	}
}
