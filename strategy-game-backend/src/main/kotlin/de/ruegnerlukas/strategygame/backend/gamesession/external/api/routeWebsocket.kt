package de.ruegnerlukas.strategygame.backend.gamesession.external.api

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.Json
import de.ruegnerlukas.strategygame.backend.common.api.ApiResponse
import de.ruegnerlukas.strategygame.backend.common.mdcConnectionId
import de.ruegnerlukas.strategygame.backend.common.mdcGameId
import de.ruegnerlukas.strategygame.backend.common.mdcTraceId
import de.ruegnerlukas.strategygame.backend.common.mdcUserId
import de.ruegnerlukas.strategygame.backend.common.withLoggingContextAsync
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.handler.MessageHandler
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.models.Message
import de.ruegnerlukas.strategygame.backend.gamesession.external.message.models.MessageMetadata
import de.ruegnerlukas.strategygame.backend.gamesession.external.api.WebsocketConstants.GAME_ID
import de.ruegnerlukas.strategygame.backend.gamesession.external.api.WebsocketConstants.USER_ID
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.ConnectToGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DisconnectFromGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.RequestConnectionToGame
import io.github.smiley4.ktorwebsocketsextended.routing.webSocketExt
import io.ktor.server.routing.*
import kotlin.collections.set

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
                    RequestConnectionToGame.GameNotFoundError -> ApiResponse.respondFailure(call, result.value)
                    RequestConnectionToGame.NotParticipantError -> ApiResponse.respondFailure(call, result.value)
                    RequestConnectionToGame.AlreadyConnectedError -> ApiResponse.respondFailure(call, result.value)
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
