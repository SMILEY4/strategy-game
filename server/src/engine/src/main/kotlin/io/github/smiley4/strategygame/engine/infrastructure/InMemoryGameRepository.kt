package io.github.smiley4.strategygame.engine.infrastructure

import io.github.smiley4.strategygame.engine.domain.Game
import io.github.smiley4.strategygame.engine.domain.GameRepository
import io.github.smiley4.strategygame.engine.domain.GameSnapshot
import io.github.smiley4.strategygame.engine.gameplay.GameStateContext
import io.github.smiley4.strategygame.engine.gameplay.GameStateRepository
import io.github.smiley4.strategygame.shared.domain.GameId

class InMemoryGameRepository : GameRepository, GameStateRepository {

    val games = mutableListOf<GameSnapshot>()
    val gameContexts = mutableMapOf<GameId, GameStateContext>()

    override fun save(game: Game) {
        games.removeIf { it.id == game.getId() }
        games.add(game.toSnapshot())
    }

    override fun delete(game: Game) {
        games.removeIf { it.id == game.getId() }
    }

    override fun findById(gameId: GameId): Game? {
        return games
            .find { it.id == gameId }
            ?.let { Game(it) }
    }

    override fun load(gameId: GameId): GameStateContext? {
        return gameContexts[gameId]
    }

    override fun save(gameId: GameId, game: GameStateContext) {
        gameContexts[gameId] = game
    }

}
