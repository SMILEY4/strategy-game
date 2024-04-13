package de.ruegnerlukas.strategygame.backend.gamesession.external.api

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.logging.mdcConnectionId
import de.ruegnerlukas.strategygame.backend.common.logging.mdcGameId
import de.ruegnerlukas.strategygame.backend.common.logging.mdcTraceId
import de.ruegnerlukas.strategygame.backend.common.logging.mdcUserId
import de.ruegnerlukas.strategygame.backend.common.logging.withLoggingContextAsync
import de.ruegnerlukas.strategygame.backend.common.models.ErrorResponse
import de.ruegnerlukas.strategygame.backend.common.utils.Json
import de.ruegnerlukas.strategygame.backend.gamesession.external.api.WebsocketConstants.GAME_ID
import de.ruegnerlukas.strategygame.backend.gamesession.external.api.WebsocketConstants.USER_ID
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.handler.MessageHandler
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.models.Message
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.models.MessageMetadata
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.ConnectToGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DisconnectFromGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.RequestConnectionToGame
import io.github.smiley4.ktorwebsocketsextended.routing.webSocketExt
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
                when (val result = requestConnection.perform(userId, gameId)) {
                    is Either.Right -> {
                        /*do nothing*/
                    }
                    is Either.Left -> when (result.value) {
                        RequestConnectionToGame.GameNotFoundError -> call.respond(GameNotFoundResponse)
                        RequestConnectionToGame.NotParticipantError -> call.respond(NotParticipantResponse)
                        RequestConnectionToGame.AlreadyConnectedError -> call.respond(AlreadyConnectedResponse)
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
                    buildMessage<Message<*>>(connection.getId(), userId, gameId, message).let {
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

