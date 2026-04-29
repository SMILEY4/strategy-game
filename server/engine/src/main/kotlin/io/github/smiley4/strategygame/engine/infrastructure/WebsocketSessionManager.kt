package io.github.smiley4.strategygame.engine.infrastructure

import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.UserId

class WebsocketSessionManager {

    data class SessionHandle(
        val userId: UserId,
        val gameId: GameId,
    )

    private val sessionHandles = mutableListOf<SessionHandle>()

    fun connect(userId: UserId, gameId: GameId) {
        sessionHandles
            .filter { it.userId == userId }
            .forEach { disconnect(it) }
        sessionHandles.add(SessionHandle(userId, gameId))
    }

    fun disconnect(userId: UserId, gameId: GameId) {
        sessionHandles
            .filter { it.userId == userId && it.gameId == gameId }
            .forEach { disconnect(it) }
    }

    private fun disconnect(handle: SessionHandle) {
        sessionHandles.remove(handle)
    }

    fun getSessionHandle(userId: UserId, gameId: GameId): SessionHandle? {
        return sessionHandles.find { it.userId == userId && it.gameId == gameId }
    }
}