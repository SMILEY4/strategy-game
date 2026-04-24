package io.github.smiley4.strategygame.platform.game.domain

import io.github.smiley4.strategygame.platform.game.GameError
import io.github.smiley4.strategygame.platform.game.GameService
import io.github.smiley4.strategygame.shared.domain.GameId
import io.github.smiley4.strategygame.shared.domain.UserId
import io.github.smiley4.strategygame.shared.utils.KeyedMutex

internal class GameServiceImpl(
    private val gameRepository: GameRepository
) : GameService {

    val keyedMutex = KeyedMutex()

    override fun create(user: UserId, name: String): GameId {

        val game = Game(
            name = name,
            owner = user
        )

        gameRepository.save(game)

        return game.getId()
    }


    override suspend fun join(user: UserId, gameId: GameId) {
        keyedMutex.withLock(gameId) {

            val game = gameRepository.findById(gameId)
                ?: throw GameError.NotFound(gameId.value.toString())

            game.join(user)

            gameRepository.save(game)
        }
    }


    override suspend fun delete(user: UserId, gameId: GameId) {
        keyedMutex.withLock(gameId) {

            val game = gameRepository.findById(gameId)
                ?: throw GameError.NotFound(gameId.value.toString())

            game.delete(user)

            gameRepository.delete(game)
        }
    }


    override fun listGames(user: UserId): List<GameId> {
        val games = gameRepository.findByPlayer(user)
        return games.map { it.getId() }
    }

}