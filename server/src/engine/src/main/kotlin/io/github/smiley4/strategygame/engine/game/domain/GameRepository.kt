package io.github.smiley4.strategygame.engine.game.domain

import io.github.smiley4.strategygame.shared.values.GameId

interface GameRepository {
    fun save(game: Game)
    fun delete(game: Game)
    fun findById(gameId: GameId): Game?
}
