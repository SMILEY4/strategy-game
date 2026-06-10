package io.github.smiley4.strategygame.engine.routing

import io.github.smiley4.ktorplus.WebSocketContext
import io.github.smiley4.ktorplus.data.Connection
import io.github.smiley4.ktorplus.data.PathParameter
import io.github.smiley4.ktorplus.webSocket
import io.github.smiley4.strategygame.engine.game.GameEngineService
import io.github.smiley4.strategygame.engine.gameplay.GameplayEngine
import io.github.smiley4.strategygame.engine.routing.GameWebsocketRoute.ClientGameMessage
import io.github.smiley4.strategygame.engine.routing.GameWebsocketRoute.GameConnection
import io.github.smiley4.strategygame.engine.routing.GameWebsocketRoute.ServerGameMessage
import io.github.smiley4.strategygame.engine.routing.GameWebsocketRoute.handleClose
import io.github.smiley4.strategygame.engine.routing.GameWebsocketRoute.handleMessage
import io.github.smiley4.strategygame.engine.routing.GameWebsocketRoute.handleOpen
import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.UserId
import io.github.smiley4.strategygame.shared.infrastructure.AuthenticatedUserId
import io.ktor.server.routing.Route
import io.ktor.websocket.CloseReason
import kotlinx.serialization.Serializable
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

internal fun Route.routeGameWebsocket(context: WebSocketContext<GameConnection, ServerGameMessage>) {
    webSocket<GameConnection, ClientGameMessage, ServerGameMessage>("", context) {
        onOpen { context, connection -> handleOpen(context, connection) }
        onClose { _, connection -> handleClose(connection) }
        onMessage { _, connection, message -> handleMessage(connection, message) }
    }
}

object GameWebsocketRoute : KoinComponent {

    private val service by inject<GameEngineService>()

    suspend fun handleOpen(context: WebSocketContext<GameConnection, ServerGameMessage>, connection: GameConnection) {
        try {
            service.connect(GameId(connection.gameId), UserId(connection.userId))
        } catch (_: Exception) {
            context.connections().close(CloseReason(CloseReason.Codes.CANNOT_ACCEPT, "Error"))
        }
    }

    fun handleClose(connection: GameConnection) {
        service.disconnect(GameId(connection.gameId), UserId(connection.userId))
    }

    suspend fun handleMessage(
        connection: GameConnection,
        message: ClientGameMessage
    ) {
        when(message) {
            is ClientGameMessage.SubmitTurn -> service.submitTurn(UserId(connection.userId), GameId(connection.gameId), listOf())
        }
    }


    @Connection
    class GameConnection(
        @PathParameter val gameId: String,
        @AuthenticatedUserId val userId: String
    )


    @Serializable
    sealed interface ClientGameMessage {
        class SubmitTurn : ClientGameMessage
    }


    @Serializable
    sealed interface ServerGameMessage {
        class SetGameState : ServerGameMessage
    }

}