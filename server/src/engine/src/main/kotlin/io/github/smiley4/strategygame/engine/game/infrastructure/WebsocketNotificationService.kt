package io.github.smiley4.strategygame.engine.game.infrastructure

import io.github.smiley4.strategygame.engine.game.domain.GameNotificationService
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.UserId

internal class WebsocketNotificationService(
    private val sessionManager: WebsocketSessionManager,
) : GameNotificationService {

    override fun connect(gameId: GameId, userId: UserId) {
        sessionManager.connect(userId, gameId)
    }

    override fun disconnect(gameId: GameId, userId: UserId) {
        sessionManager.disconnect(userId, gameId)
    }

    override fun connectedTo(userId: UserId): List<GameId> {
        return sessionManager.getSessionHandles(userId).map { it.gameId }
    }

    override fun send(gameId: GameId, userId: UserId, message: Any) {
        val sessionHandle = sessionManager.getSessionHandle(userId, gameId)
        if (sessionHandle != null) {
            // TODO: send to session handle
        }
    }

}
