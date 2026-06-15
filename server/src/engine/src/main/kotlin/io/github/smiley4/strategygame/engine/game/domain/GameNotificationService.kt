package io.github.smiley4.strategygame.engine.game.domain

import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.UserId

internal interface GameNotificationService {
    fun connect(gameId: GameId, userId: UserId)
    fun disconnect(gameId: GameId, userId: UserId)
    fun connectedTo(userId: UserId): List<GameId>
    fun send(gameId: GameId, userId: UserId, message: Any)
}
