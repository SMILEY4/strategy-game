package de.ruegnerlukas.strategygame.backend.external.api.routing

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.api.message.handler.MessageHandler
import de.ruegnerlukas.strategygame.backend.external.api.message.models.Message
import de.ruegnerlukas.strategygame.backend.external.api.websocket.ConnectionHandler
import de.ruegnerlukas.strategygame.backend.external.api.websocket.WebsocketUtils
import de.ruegnerlukas.strategygame.backend.external.api.websocket.WebsocketUtils.interceptWebsocketRequest
import de.ruegnerlukas.strategygame.backend.external.api.websocket.WebsocketUtils.websocketAuthenticate
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameConnectAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameDisconnectAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction
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
	disconnectAction: GameDisconnectAction,
	requestConnection: GameRequestConnectionAction,
	connectAction: GameConnectAction
) {
	val logger = Logging.create()
	route("game/{${WebsocketUtils.PATH_PARAM_GAME_ID}}") {
		websocketAuthenticate(userService) {
			interceptWebsocketRequest(
				interceptor = {
					val result = requestConnection.perform(
						userService.extractUserId(call.request.queryParameters[WebsocketUtils.QUERY_PARAM_TOKEN]!!),
						call.parameters[WebsocketUtils.PATH_PARAM_GAME_ID]!!
					)
					when (result) {
						is Either.Right -> {
							/*do nothing*/
						}
						is Either.Left -> when (result.value) {
							GameRequestConnectionAction.GameNotFoundError -> call.respond(HttpStatusCode.NotFound, result.value)
							GameRequestConnectionAction.NotParticipantError -> call.respond(HttpStatusCode.Conflict, result.value)
							GameRequestConnectionAction.AlreadyConnectedError -> call.respond(HttpStatusCode.Conflict, result.value)
						}
					}
				},
				callback = {
					webSocket {
						val connectionId = connectionHandler.openSession(this)
						connectAction.perform(
							getWebsocketUserIdOrThrow(userService, call),
							call.parameters[WebsocketUtils.PATH_PARAM_GAME_ID]!!,
							connectionId
						)
						try {
							for (frame in incoming) {
								when (frame) {
									is Frame.Text -> WebsocketUtils.buildMessage<Message<*>>(userService, connectionId, call, frame).let {
										messageHandler.onMessage(it)
									}
									else -> logger.warn("Unknown websocket frame-type: ${frame.frameType}")
								}
							}
						} finally {
							connectionHandler.closeSession(connectionId)
							disconnectAction.perform(getWebsocketUserIdOrThrow(userService, call))
						}
					}
				}
			)
		}
	}
}
