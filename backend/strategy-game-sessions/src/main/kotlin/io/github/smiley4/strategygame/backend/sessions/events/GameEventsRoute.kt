@file:OptIn(ExperimentalSerializationApi::class)

package io.github.smiley4.strategygame.backend.sessions.events

import io.github.smiley4.ktorplus.WebSocketContext
import io.github.smiley4.ktorplus.webSocket
import io.github.smiley4.strategygame.backend.common.logging.mdcGameId
import io.github.smiley4.strategygame.backend.common.logging.mdcTraceId
import io.github.smiley4.strategygame.backend.common.logging.mdcUserId
import io.github.smiley4.strategygame.backend.common.logging.withLoggingContextAsync
import io.github.smiley4.strategygame.backend.sessions.connect.GameConnect
import io.github.smiley4.strategygame.backend.sessions.connect.GameConnectError
import io.github.smiley4.strategygame.backend.sessions.events.models.GameEventClientMessage
import io.github.smiley4.strategygame.backend.sessions.events.models.GameEventConnection
import io.github.smiley4.strategygame.backend.sessions.events.models.GameEventServerMessage
import io.github.smiley4.strategygame.backend.sessions.turnsubmit.GameTurnSubmit
import io.ktor.server.routing.Route
import io.ktor.websocket.CloseReason
import kotlinx.serialization.ExperimentalSerializationApi
import mu.two.KotlinLogging
import org.koin.ktor.ext.inject

private val logger = KotlinLogging.logger("route.game-events")

fun Route.routeGameEvents() {
    val gameEventContext by inject<WebSocketContext<GameEventConnection, GameEventServerMessage>>()
    val gameConnect by inject<GameConnect>()
    val gameTurnSubmit by inject<GameTurnSubmit>()

    webSocket<GameEventConnection, GameEventClientMessage, GameEventServerMessage>("", gameEventContext) {
        onOpen { context, connection ->
            withLoggingContextAsync(
                mdcTraceId(),
                mdcUserId(connection.principal.userId.value),
                mdcGameId(connection.principal.gameId.value)
            ) {
                logger.info { "User ${connection.principal.userId.value} opened connection to game ${connection.principal.gameId.value}" }
                try {
                    gameConnect.connect(connection.principal.userId, connection.principal.gameId, connection)
                } catch (e: GameConnectError) {
                    when (e) {
                        is GameConnectError.GameNotFoundError -> context
                            .only(connection)
                            .close(CloseReason(CloseReason.Codes.NORMAL, "GAME_NOT_FOUND"))
                    }
                }
            }
        }
        onMessage { _, connection, message ->
            withLoggingContextAsync(
                mdcTraceId(),
                mdcUserId(connection.principal.userId.value),
                mdcGameId(connection.principal.gameId.value)
            ) {
                logger.info { "Received message from user ${connection.principal.userId.value} for game ${connection.principal.gameId.value}" }
                when (message) {
                    is GameEventClientMessage.Submit -> {
                        gameTurnSubmit.submit(
                            connection.principal.userId,
                            connection.principal.gameId,
                            message.commands.map { it.convert() }
                        )
                    }
                }
            }
        }
    }
}
