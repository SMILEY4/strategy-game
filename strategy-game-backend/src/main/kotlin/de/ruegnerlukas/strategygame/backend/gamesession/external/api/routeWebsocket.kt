package de.ruegnerlukas.strategygame.backend.gamesession.external.api

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.api.message.handler.MessageHandler
import de.ruegnerlukas.strategygame.backend.external.api.message.models.Message
import de.ruegnerlukas.strategygame.backend.external.api.message.models.MessageMetadata
import de.ruegnerlukas.strategygame.backend.external.api.routing.ApiResponse
import de.ruegnerlukas.strategygame.backend.gamesession.external.api.WebsocketConstants.GAME_ID
import de.ruegnerlukas.strategygame.backend.gamesession.external.api.WebsocketConstants.USER_ID
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameConnectAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameDisconnectAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.shared.Json
import de.ruegnerlukas.strategygame.backend.shared.mdcConnectionId
import de.ruegnerlukas.strategygame.backend.shared.mdcGameId
import de.ruegnerlukas.strategygame.backend.shared.mdcTraceId
import de.ruegnerlukas.strategygame.backend.shared.mdcUserId
import de.ruegnerlukas.strategygame.backend.shared.withLoggingContextAsync
import io.github.smiley4.ktorwebsocketsextended.routing.webSocketExt
import io.ktor.server.routing.Route

fun Route.routeWebsocket(
    messageHandler: MessageHandler,
    disconnectAction: GameDisconnectAction,
    requestConnection: GameRequestConnectionAction,
    connectAction: GameConnectAction
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
                    GameRequestConnectionAction.GameNotFoundError -> ApiResponse.respondFailure(call, result.value)
                    GameRequestConnectionAction.NotParticipantError -> ApiResponse.respondFailure(call, result.value)
                    GameRequestConnectionAction.AlreadyConnectedError -> ApiResponse.respondFailure(call, result.value)
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
