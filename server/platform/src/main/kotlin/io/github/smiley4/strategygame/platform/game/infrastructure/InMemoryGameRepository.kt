package io.github.smiley4.strategygame.platform.game.infrastructure
import io.github.smiley4.strategygame.platform.game.domain.Game
import io.github.smiley4.strategygame.platform.game.domain.GameRepository
import io.github.smiley4.strategygame.platform.game.domain.GameSnapshot
import io.github.smiley4.strategygame.shared.GameId
import io.github.smiley4.strategygame.shared.UserId

internal class InMemoryGameRepository : GameRepository {

    private val games = mutableListOf<GameSnapshot>()

    override fun save(game: Game) {
        games.removeIf { it.id == game.getId() }
        games.add(game.toSnapshot())
    }

    override fun delete(game: Game) {
        games.removeIf { it.id == game.getId() }
    }

    override fun findById(id: GameId): Game? {
        return games
            .find { it.id == id }
            ?.let { Game(it) }
    }

    override fun findByPlayer(id: UserId): List<Game> {
        return games
            .filter { game -> game.members.any { it.userId == id } }
            .map { Game(it) }
    }

}