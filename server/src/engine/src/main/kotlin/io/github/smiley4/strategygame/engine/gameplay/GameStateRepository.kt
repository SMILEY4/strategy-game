package io.github.smiley4.strategygame.engine.gameplay

import io.github.smiley4.strategygame.shared.domain.GameId

interface GameStateRepository {
    fun load(gameId: GameId): GameStateContext?
    fun save(gameId: GameId, game: GameStateContext)
}
