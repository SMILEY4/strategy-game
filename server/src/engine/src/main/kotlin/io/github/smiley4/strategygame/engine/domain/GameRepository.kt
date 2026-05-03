package io.github.smiley4.strategygame.engine.domain

import io.github.smiley4.strategygame.shared.domain.GameId

interface GameRepository {
    fun save(game: Game)
    fun delete(game: Game)
    fun findById(gameId: GameId): Game?
}
