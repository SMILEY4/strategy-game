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
import de.ruegnerlukas.strategygame.backend.shared.mdcConnectionId
import de.ruegnerlukas.strategygame.backend.shared.mdcGameId
import de.ruegnerlukas.strategygame.backend.shared.mdcTraceId
import de.ruegnerlukas.strategygame.backend.shared.mdcUserId
import de.ruegnerlukas.strategygame.backend.shared.withLoggingContextAsync
import io.ktor.server.application.ApplicationCall
import io.ktor.server.application.call
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import io.ktor.server.websocket.webSocket
import io.ktor.websocket.DefaultWebSocketSession
import io.ktor.websocket.Frame
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
                    val userId = userService.extractUserId(call.request.queryParameters[WebsocketUtils.QUERY_PARAM_TOKEN]!!)
                    val gameId = call.parameters[WebsocketUtils.PATH_PARAM_GAME_ID]!!
                    withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId)) {
                        handleConnectionRequest(requestConnection, userId, gameId, call)
                    }
                },
                callback = {
                    webSocket {
                        val userId = getWebsocketUserIdOrThrow(userService, call)
                        val gameId = call.parameters[WebsocketUtils.PATH_PARAM_GAME_ID]!!
                        val connectionId: Int = withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId)) {
                            handleOpenConnection(connectionHandler, connectAction, this, userId, gameId)
                        }
                        try {
                            for (frame in incoming) {
                                withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId), mdcConnectionId(connectionId)) {
                                    handleIncomingFrame(userService, messageHandler, logger, connectionId, call, frame)
                                }
                            }
                        } finally {
                            withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId), mdcConnectionId(connectionId)) {
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


private suspend fun handleConnectionRequest(
    requestConnection: GameRequestConnectionAction,
    userId: String,
    gameId: String,
    call: ApplicationCall
) {
    when (val result = requestConnection.perform(userId, gameId)) {
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


private suspend fun handleOpenConnection(
    connectionHandler: ConnectionHandler,
    connectAction: GameConnectAction,
    session: DefaultWebSocketSession,
    userId: String,
    gameId: String,
): Int {
    val connectionId = connectionHandler.openSession(session)
    connectAction.perform(userId, gameId, connectionId)
    return connectionId
}


private suspend fun handleIncomingFrame(
    userService: UserIdentityService,
    messageHandler: MessageHandler,
    logger: org.slf4j.Logger,
    connectionId: Int,
    call: ApplicationCall,
    frame: Frame
) {
    when (frame) {
        is Frame.Text -> WebsocketUtils.buildMessage<Message<*>>(userService, connectionId, call, frame).let {
            messageHandler.onMessage(it)
        }
        else -> logger.warn("Unknown websocket frame-type: ${frame.frameType}")
    }
}
