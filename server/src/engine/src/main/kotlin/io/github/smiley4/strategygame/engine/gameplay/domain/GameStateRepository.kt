package io.github.smiley4.strategygame.engine.gameplay.domain

import io.github.smiley4.strategygame.engine.gameplay.domain.gamestate.GameStateContext
import io.github.smiley4.strategygame.shared.values.GameId

interface GameStateRepository {
    fun load(gameId: GameId): GameStateContext?
    fun save(gameId: GameId, game: GameStateContext)
}
