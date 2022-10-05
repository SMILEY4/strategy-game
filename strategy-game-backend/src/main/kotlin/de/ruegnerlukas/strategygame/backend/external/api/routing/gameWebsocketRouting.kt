package de.ruegnerlukas.strategygame.backend.external.api.routing

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.api.message.handler.MessageHandler
import de.ruegnerlukas.strategygame.backend.external.api.message.models.Message
import de.ruegnerlukas.strategygame.backend.external.api.message.websocket.ConnectionHandler
import de.ruegnerlukas.strategygame.backend.external.api.message.websocket.WebsocketUtils
import de.ruegnerlukas.strategygame.backend.external.api.message.websocket.WebsocketUtils.interceptWebsocketRequest
import de.ruegnerlukas.strategygame.backend.external.api.message.websocket.WebsocketUtils.websocketAuthenticate
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameConnectAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameDisconnectAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.shared.traceId
import io.ktor.server.application.call
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import io.ktor.server.websocket.webSocket
import io.ktor.websocket.Frame
import mu.withLoggingContext
import org.koin.ktor.ext.inject


/**
 * Configuration for game-websocket routes
 */
fun Route.gameWebsocketRoutes() {

    val connectionHandler by inject<ConnectionHandler>()
    val userService by inject<UserIdentityService>()
    val messageHandler by inject<MessageHandler>()
    val disconnectAction by inject<GameDisconnectAction>()
    val requestConnection by inject<GameRequestConnectionAction>()
    val connectAction by inject<GameConnectAction>()

    val logger = Logging.create()
    route("game/{${WebsocketUtils.PATH_PARAM_GAME_ID}}") {
        websocketAuthenticate(userService) {
            interceptWebsocketRequest(
                interceptor = {
                    withLoggingContext(traceId()) {
                        val result = requestConnection.perform(
                            userService.extractUserId(call.request.queryParameters[WebsocketUtils.QUERY_PARAM_TOKEN]!!),
                            call.parameters[WebsocketUtils.PATH_PARAM_GAME_ID]!!
                        )
                        when (result) {
                            is Either.Right -> {
                                /*do nothing*/
                            }
                            is Either.Left -> when (result.value) {
                                GameRequestConnectionAction.GameNotFoundError -> ApiResponse.respondFailure(call, result.value)
                                GameRequestConnectionAction.NotParticipantError -> ApiResponse.respondFailure(call, result.value)
                                GameRequestConnectionAction.AlreadyConnectedError -> ApiResponse.respondFailure(call, result.value)
                            }
                        }
                    }
                },
                callback = {
                    webSocket {
                        withLoggingContext(traceId()) {
                            val connectionId = connectionHandler.openSession(this)
                            connectAction.perform(
                                getWebsocketUserIdOrThrow(userService, call),
                                call.parameters[WebsocketUtils.PATH_PARAM_GAME_ID]!!,
                                connectionId
                            )
                            try {
                                for (frame in incoming) {
                                    when (frame) {
                                        is Frame.Text -> WebsocketUtils.buildMessage<Message<*>>(userService, connectionId, call, frame)
                                            .let {
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
                }
            )
        }
    }
}
