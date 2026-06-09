package io.github.smiley4.strategygame.engine.domain

import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.UserId

internal interface GameNotificationService {
    fun connect(gameId: GameId, userId: UserId)
    fun disconnect(gameId: GameId, userId: UserId)
    fun isReachable(gameId: GameId, userId: UserId): Boolean
    fun send(gameId: GameId, userId: UserId, message: Any)
}
