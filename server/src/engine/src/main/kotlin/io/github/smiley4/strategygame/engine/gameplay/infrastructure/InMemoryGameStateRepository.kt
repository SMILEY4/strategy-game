package io.github.smiley4.strategygame.engine.gameplay.infrastructure

import io.github.smiley4.strategygame.engine.gameplay.domain.GameStateContext
import io.github.smiley4.strategygame.engine.gameplay.domain.GameStateRepository
import io.github.smiley4.strategygame.shared.values.GameId

class InMemoryGameStateRepository : GameStateRepository {

    val gameContexts = mutableMapOf<GameId, GameStateContext>()

    override fun load(gameId: GameId): GameStateContext? {
        return gameContexts[gameId]
    }

    override fun save(gameId: GameId, game: GameStateContext) {
        gameContexts[gameId] = game
    }

}