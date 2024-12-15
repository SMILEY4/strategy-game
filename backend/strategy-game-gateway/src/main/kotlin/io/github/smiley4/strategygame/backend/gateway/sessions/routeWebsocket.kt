package io.github.smiley4.strategygame.backend.gateway.sessions

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.logging.mdcConnectionId
import io.github.smiley4.strategygame.backend.common.logging.mdcGameId
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.common.utils.Json
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.gateway.ErrorResponse
import io.github.smiley4.strategygame.backend.gateway.ErrorResponseException
import io.github.smiley4.strategygame.backend.gateway.websocket.auth.WebsocketTicketAuthManager
import io.github.smiley4.strategygame.backend.gateway.websocket.routing.webSocketExt
import io.github.smiley4.strategygame.backend.gateway.websocket.session.WebSocketConnectionHandler
import io.github.smiley4.strategygame.backend.gateway.sessions.models.Message
import io.github.smiley4.strategygame.backend.gateway.sessions.models.MessageMetadata
import io.github.smiley4.strategygame.backend.sessions.ports.provided.ConnectToGame
import io.github.smiley4.strategygame.backend.sessions.ports.provided.DisconnectPlayer
import io.github.smiley4.strategygame.backend.sessions.ports.provided.RequestConnectionToGame
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import kotlin.collections.set

internal object RouteWebsocket : Logging {

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

    fun Route.routeWebsocket(
        ticketManager: WebsocketTicketAuthManager,
        connectionHandler: WebSocketConnectionHandler,
        messageHandler: GatewayGameMessageHandler,
        disconnectAction: DisconnectPlayer,
        requestConnection: RequestConnectionToGame,
        connectAction: ConnectToGame
    ) = webSocketExt("{${WebsocketConstants.GAME_ID}}", connectionHandler, ticketManager, authenticate = true) {

        // read the ticket from the incoming connection
        provideTicket { it.parameters["ticket"]!! }

        // handle incoming connection, return non 2xx to not accept the connection
        onConnect { call, data ->
            if(data == null) {
                throw Exception("No websocket connection data found.")
            }
            val userId = data.data[WebsocketConstants.USER_ID]!! as String
            val gameId = call.parameters[WebsocketConstants.GAME_ID]!!.also { data.data[WebsocketConstants.GAME_ID] = it }
            withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId)) {
                try {
                    requestConnection.perform(User.Id(userId), Game.Id(gameId))
                } catch (e: RequestConnectionToGame.GameRequestConnectionActionError) {
                    when (e) {
                        is RequestConnectionToGame.GameNotFoundError -> throw ErrorResponseException(GameNotFoundResponse)
                        is RequestConnectionToGame.NotParticipantError -> throw ErrorResponseException(NotParticipantResponse)
                        is RequestConnectionToGame.AlreadyConnectedError -> throw ErrorResponseException(AlreadyConnectedResponse)
                    }
                }
            }
        }

        // handle established connection
        onOpen { connection ->
            val userId = connection.data.data[WebsocketConstants.USER_ID]!! as String
            val gameId = connection.data.data[WebsocketConstants.GAME_ID]!! as String
            withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId), mdcConnectionId(connection.id)) {
                connectAction.perform(User.Id(userId), Game.Id(gameId), connection.id)
            }
        }

        // handle each incoming websocket message
        onEachText { connection, strMessage ->
            val userId = connection.data.data[WebsocketConstants.USER_ID]!! as String
            val gameId = connection.data.data[WebsocketConstants.GAME_ID]!! as String
            withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId), mdcConnectionId(connection.id)) {
                buildMessage<Message<*>>(connection.id, userId, gameId, strMessage).let {
                    messageHandler.onMessage(it)
                }
            }
        }

        // handle a closed connection
        onClose { connection ->
            val userId = connection.data.data[WebsocketConstants.USER_ID]!! as String
            val gameId = connection.data.data[WebsocketConstants.GAME_ID]!! as String
            withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId), mdcConnectionId(connection.id)) {
                disconnectAction.perform(User.Id(userId))
            }
        }
    }

    private fun <T> buildMessage(connectionId: Long, userId: String, gameId: String, content: String): Message<T> {
        return Json.fromString<Message<T>>(content).apply {
            meta = MessageMetadata(connectionId, userId, gameId)
        }
    }

}

