package io.github.smiley4.strategygame.engine.game.infrastructure

import io.github.smiley4.strategygame.engine.game.domain.Game
import io.github.smiley4.strategygame.engine.game.domain.GameRepository
import io.github.smiley4.strategygame.engine.game.domain.GameSnapshot
import io.github.smiley4.strategygame.shared.values.GameId

/**
 * In-memory implementation of [GameRepository].
 */
class InMemoryGameRepository : GameRepository {

    val games = mutableListOf<GameSnapshot>()

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

}