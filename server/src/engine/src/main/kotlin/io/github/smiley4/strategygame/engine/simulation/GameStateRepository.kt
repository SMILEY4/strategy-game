package io.github.smiley4.strategygame.engine.simulation

import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.shared.values.GameId

interface GameStateRepository {
    fun load(gameId: GameId): GameStateContext?
    fun save(gameId: GameId, game: GameStateContext)
    fun delete(gameId: GameId)
}
