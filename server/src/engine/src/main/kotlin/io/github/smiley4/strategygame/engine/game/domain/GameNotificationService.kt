package io.github.smiley4.strategygame.engine.game.domain

import com.lectra.koson.ObjectType
import io.github.smiley4.strategygame.shared.values.GameId
import io.github.smiley4.strategygame.shared.values.UserId

internal interface GameNotificationService {
    suspend fun disconnect(gameId: GameId, userId: UserId)
    suspend fun sendGameState(gameId: GameId, userId: UserId, gameState: ObjectType)
    fun getConnectedGames(userId: UserId): List<GameId>
    fun getConnectedUsers(gameId: GameId): List<UserId>
}
