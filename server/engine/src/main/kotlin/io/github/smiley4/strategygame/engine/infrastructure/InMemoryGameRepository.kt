package io.github.smiley4.strategygame.engine.infrastructure

import io.github.smiley4.strategygame.engine.domain.Game
import io.github.smiley4.strategygame.engine.domain.GameRepository
import io.github.smiley4.strategygame.engine.gameplay.GameStateContext
import io.github.smiley4.strategygame.engine.gameplay.GameStateRepository
import io.github.smiley4.strategygame.shared.domain.GameId

class InMemoryGameRepository : GameRepository, GameStateRepository {

    override fun save(game: Game) {
        TODO("Not yet implemented")
    }

    override fun delete(game: Game) {
        TODO("Not yet implemented")
    }

    override fun findById(gameId: GameId): Game? {
        TODO("Not yet implemented")
    }

    override fun load(gameId: GameId): GameStateContext {
        TODO("Not yet implemented")
    }

    override fun save(game: GameStateContext) {
        TODO("Not yet implemented")
    }

}