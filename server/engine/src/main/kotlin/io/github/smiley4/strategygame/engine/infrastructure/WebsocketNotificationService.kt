package io.github.smiley4.strategygame.engine.infrastructure

import io.github.smiley4.strategygame.engine.domain.GameNotificationService
import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.UserId

internal class WebsocketNotificationService(
    private val sessionManager: WebsocketSessionManager,
) : GameNotificationService {

    override fun isReachable(gameId: GameId, userId: UserId): Boolean {
        return sessionManager.getSessionHandle(userId, gameId) != null
    }

    override fun send(gameId: GameId, userId: UserId, message: Any) {
        val sessionHandle = sessionManager.getSessionHandle(userId, gameId)
        if (sessionHandle != null) {
            // TODO: send to session handle
        }
    }

}