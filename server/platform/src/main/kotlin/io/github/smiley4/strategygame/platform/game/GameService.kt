package io.github.smiley4.strategygame.platform.game

import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.UserId


interface GameService {
    fun create(user: UserId, name: String): GameId
    suspend fun join(user: UserId, gameId: GameId)
    suspend fun delete(user: UserId, gameId: GameId)
    fun listGames(user: UserId): List<GameId>
}