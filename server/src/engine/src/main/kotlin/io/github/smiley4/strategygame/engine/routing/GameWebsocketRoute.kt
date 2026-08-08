package io.github.smiley4.strategygame.engine.routing

import io.github.smiley4.ktorplus.WebSocketContext
import io.github.smiley4.ktorplus.data.Connection
import io.github.smiley4.ktorplus.data.PathParameter
import io.github.smiley4.ktorplus.webSocket
import io.github.smiley4.strategygame.engine.game.GameService
import io.github.smiley4.strategygame.engine.routing.GameWebsocketRoute.ClientGameMessage
import io.github.smiley4.strategygame.engine.routing.GameWebsocketRoute.GameConnection
import io.github.smiley4.strategygame.engine.routing.GameWebsocketRoute.ServerGameMessage
import io.github.smiley4.strategygame.engine.routing.GameWebsocketRoute.handleMessage
import io.github.smiley4.strategygame.engine.routing.GameWebsocketRoute.handleOpen
import io.github.smiley4.strategygame.shared.infrastructure.AuthenticatedUserId
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.UserId
import io.ktor.server.routing.Route
import io.ktor.websocket.CloseReason
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import org.koin.core.component.KoinComponent
import org.koin.core.component.inject

internal fun Route.routeGameWebsocket(context: WebSocketContext<GameConnection, ServerGameMessage>) {
    webSocket<GameConnection, ClientGameMessage, ServerGameMessage>("", context) {
        onOpen { context, connection -> handleOpen(context, connection) }
        onClose { context, connection -> println("Connection closed: $connection") }
        onMessage { _, connection, message -> handleMessage(connection, message) }
    }
}


/**
 * WebSocket route handler for real-time game communication.
 * Exposes [GameConnection], [ClientGameMessage], and [ServerGameMessage] types.
 */
object GameWebsocketRoute : KoinComponent {

    private val service by inject<GameService>()

    suspend fun handleOpen(context: WebSocketContext<GameConnection, ServerGameMessage>, connection: GameConnection) {
        try {
            service.connect(GameId(connection.gameId), connection.userId)
        } catch (e: Exception) {
            e.printStackTrace()
            context.connections().close(CloseReason(CloseReason.Codes.CANNOT_ACCEPT, "Error"))
        }
    }

    suspend fun handleMessage(connection: GameConnection, message: ClientGameMessage) {
        when (message) {
            is ClientGameMessage.SubmitTurn -> service.submitTurn(
                connection.userId,
                GameId(connection.gameId),
                message.commands.map { it.toDomain(connection.userId) }
            )
        }
    }


    /**
     * Represents a connected player for a specific game.
     */
    @Connection
    class GameConnection(
        @PathParameter val gameId: String,
        @AuthenticatedUserId val userId: UserId
    )


    /**
     * Messages sent from the client to the server over the WebSocket.
     */
    @Serializable
    sealed interface ClientGameMessage {
        @Serializable
        @SerialName("ClientGameMessage.SubmitTurn")
        class SubmitTurn(val commands: List<PlayerCommandDto>) : ClientGameMessage
    }


    /**
     * Messages sent from the server to the client over the WebSocket.
     */
    @Serializable
    sealed interface ServerGameMessage {
        @Serializable
        @SerialName("ServerGameMessage.GameState")
        class GameState(val state: JsonElement) : ServerGameMessage
    }

}