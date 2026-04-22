package io.github.smiley4.strategygame.platform.game

import io.github.smiley4.strategygame.shared.GameId
import io.github.smiley4.strategygame.shared.UserId


interface GameService {
    fun create(user: UserId, name: String): GameId
    fun join(user: UserId, gameId: GameId)
    fun delete(user: UserId, gameId: GameId)
    fun listGames(user: UserId): List<GameId>
}