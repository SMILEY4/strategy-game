package io.github.smiley4.strategygame.platform.game.domain

import io.github.smiley4.strategygame.identity.user.domain.UserId
import io.github.smiley4.strategygame.platform.game.GameError
import io.github.smiley4.strategygame.platform.game.GameService

internal class GameServiceImpl(
    private val gameRepository: GameRepository
) : GameService {

    override fun create(user: UserId, name: String): GameId {

        val game = Game(
            name = name,
            owner = user
        )

        gameRepository.save(game)

        return game.getId()
    }


    override fun join(user: UserId, gameId: GameId) {

        val game = gameRepository.findById(gameId)
            ?: throw GameError.NotFound(gameId.value.toString())

        game.join(user)

        gameRepository.save(game)
    }


    override fun delete(user: UserId, gameId: GameId) {

        val game = gameRepository.findById(gameId)
            ?: throw GameError.NotFound(gameId.value.toString())

        game.delete(user)

        gameRepository.delete(game)
    }


    override fun listGames(user: UserId): List<GameId> {
        val games = gameRepository.findByPlayer(user)
        return games.map { it.getId() }
    }

}