package io.github.smiley4.strategygame.backend.worlds.module.api

import io.github.smiley4.ktorwebsocketsextended.routing.webSocketExt
import io.github.smiley4.strategygame.backend.commondata.ErrorResponse
import io.github.smiley4.strategygame.backend.worlds.module.api.WebsocketConstants.GAME_ID
import io.github.smiley4.strategygame.backend.worlds.module.api.WebsocketConstants.USER_ID
import io.github.smiley4.strategygame.backend.worlds.module.core.provided.DisconnectFromGame
import io.github.smiley4.strategygame.backend.worlds.module.core.provided.RequestConnectionToGame
import io.github.smiley4.strategygame.backend.worlds.module.message.handler.MessageHandler
import io.github.smiley4.strategygame.backend.worlds.module.message.models.Message
import io.github.smiley4.strategygame.backend.worlds.module.message.models.MessageMetadata
import io.ktor.server.response.respond
import io.ktor.server.routing.Route
import kotlin.collections.set

object RouteWebsocket {

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
        messageHandler: MessageHandler,
        disconnectAction: DisconnectFromGame,
        requestConnection: RequestConnectionToGame,
        connectAction: ConnectToGame
    ) = webSocketExt("{${GAME_ID}}", authenticate = true) {
        provideTicket { it.parameters["ticket"]!! }
        onConnect { call, data ->
            val userId = data[USER_ID]!! as String
            val gameId = call.parameters[GAME_ID]!!.also { data[GAME_ID] = it }
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
        onOpen { connection ->
            val userId = connection.getData<String>(USER_ID)!!
            val gameId = connection.getData<String>(GAME_ID)!!
            withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId), mdcConnectionId(connection.getId())) {
                connectAction.perform(userId, gameId, connection.getId())
            }
        }
        text {
            onEach { connection, message ->
                val userId = connection.getData<String>(USER_ID)!!
                val gameId = connection.getData<String>(GAME_ID)!!
                withLoggingContextAsync(mdcTraceId(), mdcUserId(userId), mdcGameId(gameId), mdcConnectionId(connection.getId())) {
                    buildMessage<Message<*>>(
                        connection.getId(),
                        userId,
                        gameId,
                        message
                    ).let {
                        messageHandler.onMessage(it)
                    }
                }
            }
        }
        onClose { connection ->
            val userId = connection.getData<String>(USER_ID)!!
            val gameId = connection.getData<String>(GAME_ID)!!
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

