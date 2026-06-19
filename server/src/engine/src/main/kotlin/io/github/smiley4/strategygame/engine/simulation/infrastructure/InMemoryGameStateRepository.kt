package io.github.smiley4.strategygame.engine.simulation.infrastructure

import io.github.smiley4.strategygame.engine.simulation.gamestate.GameStateContext
import io.github.smiley4.strategygame.engine.simulation.GameStateRepository
import io.github.smiley4.strategygame.shared.values.GameId

class InMemoryGameStateRepository : GameStateRepository {

    val gameContexts = mutableMapOf<GameId, GameStateContext>()

    override fun load(gameId: GameId): GameStateContext? {
        return gameContexts[gameId]
    }

    override fun save(gameId: GameId, game: GameStateContext) {
        gameContexts[gameId] = game
    }

    override fun delete(gameId: GameId) {
        gameContexts.remove(gameId)
    }

}