package io.github.smiley4.strategygame.platform.game

import io.github.smiley4.strategygame.identity.user.domain.UserId
import io.github.smiley4.strategygame.platform.game.domain.GameId

interface GameService {
    fun create(user: UserId, name: String): GameId
    fun join(user: UserId, gameId: GameId)
    fun delete(user: UserId, gameId: GameId)
    fun listGames(user: UserId): List<GameId>
}