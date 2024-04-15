package de.ruegnerlukas.strategygame.backend.gamesession.core

import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.common.utils.COUNTRY_COLORS
import de.ruegnerlukas.strategygame.backend.common.utils.getOrThrow
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.InitializePlayer
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Game
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Player
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.PlayerState
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.JoinGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.JoinGame.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.JoinGame.UserAlreadyJoinedError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameQuery
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameUpdate

class JoinGameImpl(
    private val gameQuery: GameQuery,
    private val gameUpdate: GameUpdate,
    private val initializePlayer: InitializePlayer
) : JoinGame, Logging {

    private val metricId = MetricId.action(JoinGame::class)


    override suspend fun perform(userId: String, gameId: String) {
        return time(metricId) {
            log().info("Joining game $gameId as user $userId")
            val game = findGame(gameId)
            validate(game, userId)
            createPlayer(game, userId)
            initializePlayer(game, userId)
        }
    }


    /**
     * Find and return the game with the given id or an [GameNotFoundError] if the game does not exist
     */
    private suspend fun findGame(gameId: String): Game {
        try {
            return gameQuery.execute(gameId)
        } catch (e: EntityNotFoundError) {
            throw GameNotFoundError()
        }
    }


    /**
     * Validate whether the given user can join the given game. Return nothing or an [UserAlreadyJoinedError]
     */
    private fun validate(game: Game, userId: String) {
        if (game.players.existsByUserId(userId)) {
            log().warn("User has $userId already joined game ${game.gameId}")
            throw UserAlreadyJoinedError()
        }
    }


    /**
     * Add the user as a player to the given game
     */
    private suspend fun createPlayer(game: Game, userId: String) {
        game.players.add(
            Player(
                userId = userId,
                connectionId = null,
                state = PlayerState.PLAYING,
            )
        )
        gameUpdate.execute(game)
    }


    /**
     * Create the necessary data in the game-world
     */
    private suspend fun initializePlayer(game: Game, userId: String) {
        initializePlayer.perform(game.gameId, userId, COUNTRY_COLORS[(game.players.size - 1) % COUNTRY_COLORS.size])
    }

}