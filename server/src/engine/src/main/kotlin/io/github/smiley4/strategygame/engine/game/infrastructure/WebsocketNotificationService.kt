package io.github.smiley4.strategygame.engine.game.infrastructure

import com.lectra.koson.KosonType
import com.lectra.koson.ObjectType
import io.github.smiley4.ktorplus.WebSocketContext
import io.github.smiley4.strategygame.engine.game.domain.GameNotificationService
import io.github.smiley4.strategygame.engine.routing.GameWebsocketRoute.GameConnection
import io.github.smiley4.strategygame.engine.routing.GameWebsocketRoute.ServerGameMessage
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.UserId
import io.ktor.websocket.CloseReason

internal class WebsocketNotificationService(
    private val wsContext: WebSocketContext<GameConnection, ServerGameMessage>,
) : GameNotificationService {

    override suspend fun disconnect(gameId: GameId, userId: UserId) {
        wsContext.connections()
            .filter { it.userId == userId.id.toString() && it.gameId == gameId.id.toString() }
            .close(CloseReason(CloseReason.Codes.NORMAL, "Disconnected from server"))
    }

    override suspend fun sendGameState(gameId: GameId, userId: UserId, gameState: ObjectType) {
        wsContext.connections()
            .filter { it.userId == userId.id.toString() && it.gameId == gameId.id.toString() }
            .send(ServerGameMessage.GameState(gameState.pretty(3)))
    }

    override fun getConnectedGames(userId: UserId): List<GameId> {
        return wsContext.connections().toList()
            .filter { it.userId == userId.id.toString() }
            .map { GameId(it.gameId) }
    }

    override fun getConnectedUsers(gameId: GameId): List<UserId> {
        return wsContext.connections().toList()
            .filter { it.gameId == gameId.id.toString() }
            .map { UserId(it.userId) }
    }


}
