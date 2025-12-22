package io.github.smiley4.strategygame.backend.sessions.events

import io.github.smiley4.strategygame.backend.common.ErrorResponse
import io.github.smiley4.strategygame.backend.common.ErrorResponseException
import io.github.smiley4.strategygame.backend.common.logging.mdcConnectionId
import io.github.smiley4.strategygame.backend.common.logging.mdcGameId
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.common.utils.Json
import io.github.smiley4.strategygame.backend.common.websocket.auth.WebsocketTicketAuthManager
import io.github.smiley4.strategygame.backend.common.websocket.messages.Message
import io.github.smiley4.strategygame.backend.common.websocket.messages.MessageMetadata
import io.github.smiley4.strategygame.backend.common.websocket.routing.webSocketExt
import io.github.smiley4.strategygame.backend.common.websocket.routing.webSocketTicket
import io.github.smiley4.strategygame.backend.common.websocket.session.WebSocketConnectionHandler
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.sessions.connect.GameConnect
import io.github.smiley4.strategygame.backend.sessions.connect.GameConnectError
import io.github.smiley4.strategygame.backend.sessions.disconnectplayer.GameDisconnectPlayer
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import org.koin.ktor.ext.inject

private object GameNotFoundResponse : ErrorResponse(
    status = 404,
    title = "Game not found",
    errorCode = "GAME_NOT_FOUND",
    detail = "Game could not be found when trying to connect to it.",
)

private object AlreadyConnectedResponse : ErrorResponse(
    status = 409,
    title = "Already connected",
    errorCode = "ALREADY_CONNECTED",
    detail = "The user is already connected to this game.",
)

private object NotParticipantResponse : ErrorResponse(
    status = 409,
    title = "Not a Participant",
    errorCode = "NOT_PARTICIPANT",
    detail = "The user is not a participant of this game.",
)

fun Route.routeGameEventsTicket() {
    val wsTicketManager by inject<WebsocketTicketAuthManager>()
    route("wsticket") {
        webSocketTicket(wsTicketManager) {
            mapOf("userId" to it.principal<JWTPrincipal>()?.subject!!)
        }
    }
}

fun Route.routeGameEvents() {

    val wsTicketManager by inject<WebsocketTicketAuthManager>()
    val wsConnectionHandler by inject<WebSocketConnectionHandler>()
    val gameConnect by inject<GameConnect>()
    val gameDisconnectPlayer by inject<GameDisconnectPlayer>()
    val gameEventHandler by inject<GameEventHandler>()

    route("connect") {
        webSocketExt("{gameId}", wsConnectionHandler, wsTicketManager, authenticate = true) {

            // read the ticket from the incoming connection
            provideTicket { it.parameters["ticket"]!! }

            // handle incoming connection, return non 2xx to not accept the connection
            onConnect { call, data ->
                if (data == null) {
                    throw Exception("No websocket connection data found.")
                }
                val userId = data.data["userId"]!! as String
                val gameId = call.parameters["gameId"]!!.also { data.data["gameId"] = it }
                withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId)) {
                    try {
                        gameConnect.request(User.Id(userId), Game.Id(gameId))
                    } catch (e: GameConnectError) {
                        when (e) {
                            is GameConnectError.GameNotFoundError -> throw ErrorResponseException(GameNotFoundResponse)
                            is GameConnectError.NotParticipantError -> throw ErrorResponseException(NotParticipantResponse)
                            is GameConnectError.AlreadyConnectedError -> throw ErrorResponseException(AlreadyConnectedResponse)
                            else -> throw e
                        }
                    }
                }
            }

            // handle established connection
            onOpen { connection ->
                val userId = connection.data.data["userId"]!! as String
                val gameId = connection.data.data["gameId"]!! as String
                withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId), mdcConnectionId(connection.id)) {
                    gameConnect.connect(User.Id(userId), Game.Id(gameId), connection.id)
                }
            }

            // handle each incoming websocket message
            onEachText { connection, strMessage ->
                val userId = connection.data.data["userId"]!! as String
                val gameId = connection.data.data["gameId"]!! as String
                withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId), mdcConnectionId(connection.id)) {
                    buildMessage<Message<*>>(connection.id, userId, gameId, strMessage).let {
                        gameEventHandler.onMessage(it)
                    }
                }
            }

            // handle a closed connection
            onClose { connection ->
                val userId = connection.data.data["userId"]!! as String
                val gameId = connection.data.data["gameId"]!! as String
                withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId), mdcConnectionId(connection.id)) {
                    gameDisconnectPlayer.disconnect(User.Id(userId))
                }
            }

        }
    }
}

private fun <T> buildMessage(connectionId: Long, userId: String, gameId: String, content: String): Message<T> {
    return Json.fromString<Message<T>>(content).apply {
        meta = MessageMetadata(connectionId, userId, gameId)
    }
}