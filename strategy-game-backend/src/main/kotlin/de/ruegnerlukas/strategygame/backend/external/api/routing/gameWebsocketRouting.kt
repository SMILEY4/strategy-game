package de.ruegnerlukas.strategygame.backend.external.api.routing

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.external.api.message.handler.MessageHandler
import de.ruegnerlukas.strategygame.backend.external.api.message.models.Message
import de.ruegnerlukas.strategygame.backend.external.api.message.models.MessageMetadata
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameConnectAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameDisconnectAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.shared.Json
import de.ruegnerlukas.strategygame.backend.shared.mdcConnectionId
import de.ruegnerlukas.strategygame.backend.shared.mdcGameId
import de.ruegnerlukas.strategygame.backend.shared.mdcTraceId
import de.ruegnerlukas.strategygame.backend.shared.mdcUserId
import de.ruegnerlukas.strategygame.backend.shared.withLoggingContextAsync
import io.github.smiley4.ktorwebsocketsextended.routing.webSocketExt
import io.github.smiley4.ktorwebsocketsextended.routing.webSocketTicket
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.auth.principal
import io.ktor.server.routing.Route
import io.ktor.server.routing.route
import org.koin.ktor.ext.inject

private const val GAME_ID = "gameId"
private const val USER_ID = "userId"

/**
 * Configuration for game-websocket routes
 */
fun Route.gameWebsocketRoutes() {

    val messageHandler by inject<MessageHandler>()
    val disconnectAction by inject<GameDisconnectAction>()
    val requestConnection by inject<GameRequestConnectionAction>()
    val connectAction by inject<GameConnectAction>()

    route("game") {
        authenticate {
            route("/wsticket") {
                webSocketTicket {
                    mapOf(USER_ID to it.principal<JWTPrincipal>()?.subject!!)
                }
            }
        }
        webSocketExt("{$GAME_ID}", authenticate = true) {
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
                connectAction.perform(userId, gameId, connection.getId())
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
    }
}

private fun <T> buildMessage(connectionId: Long, userId: String, gameId: String, content: String): Message<T> {
    return Json.fromString<Message<T>>(content).apply {
        meta = MessageMetadata(connectionId, userId, gameId)
    }
}
