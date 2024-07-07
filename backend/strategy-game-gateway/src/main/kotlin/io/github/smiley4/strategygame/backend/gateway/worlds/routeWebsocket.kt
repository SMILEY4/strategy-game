package io.github.smiley4.strategygame.backend.gateway.worlds

import io.github.smiley4.strategygame.backend.common.logging.mdcConnectionId
import io.github.smiley4.strategygame.backend.common.logging.mdcGameId
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.common.utils.Json
import io.github.smiley4.strategygame.backend.gateway.ErrorResponse
import io.github.smiley4.strategygame.backend.gateway.websocket.auth.WebsocketTicketAuthManager
import io.github.smiley4.strategygame.backend.gateway.websocket.routing.webSocketExt
import io.github.smiley4.strategygame.backend.gateway.websocket.session.WebSocketConnectionHandler
import io.github.smiley4.strategygame.backend.gateway.worlds.models.Message
import io.github.smiley4.strategygame.backend.gateway.worlds.models.MessageMetadata
import io.github.smiley4.strategygame.backend.worlds.edge.ConnectToGame
import io.github.smiley4.strategygame.backend.worlds.edge.DisconnectPlayer
import io.github.smiley4.strategygame.backend.worlds.edge.RequestConnectionToGame
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import kotlin.collections.set

internal object RouteWebsocket {

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
            val userId = data[WebsocketConstants.USER_ID]!! as String
            val gameId = call.parameters[WebsocketConstants.GAME_ID]!!.also { data[WebsocketConstants.GAME_ID] = it }
            withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId)) {
                try {
                    requestConnection.perform(userId, gameId)
                } catch (e: RequestConnectionToGame.GameRequestConnectionActionError) {
                    when (e) {
                        is RequestConnectionToGame.GameNotFoundError -> call.respond(GameNotFoundResponse)
                        is RequestConnectionToGame.NotParticipantError -> call.respond(NotParticipantResponse)
                        is RequestConnectionToGame.AlreadyConnectedError -> call.respond(AlreadyConnectedResponse)
                    }
                }
            }
        }

        // handle established connection
        onOpen { connection ->
            val userId = connection.getData<String>(WebsocketConstants.USER_ID)!!
            val gameId = connection.getData<String>(WebsocketConstants.GAME_ID)!!
            withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId), mdcConnectionId(connection.getId())) {
                connectAction.perform(userId, gameId, connection.getId())
            }
        }

        // handle each incoming websocket message
        onEachText { connection, strMessage ->
            val userId = connection.getData<String>(WebsocketConstants.USER_ID)!!
            val gameId = connection.getData<String>(WebsocketConstants.GAME_ID)!!
            withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId), mdcConnectionId(connection.getId())) {
                buildMessage<Message<*>>(connection.getId(), userId, gameId, strMessage).let {
                    messageHandler.onMessage(it)
                }
            }
        }

        // handle a closed connection
        onClose { connection ->
            val userId = connection.getData<String>(WebsocketConstants.USER_ID)!!
            val gameId = connection.getData<String>(WebsocketConstants.GAME_ID)!!
            withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId), mdcConnectionId(connection.getId())) {
                disconnectAction.perform(userId)
            }
        }
    }

    private fun <T> buildMessage(connectionId: Long, userId: String, gameId: String, content: String): Message<T> {
        return Json.fromString<Message<T>>(content).apply {
            meta = MessageMetadata(connectionId, userId, gameId)
        }
    }

}

