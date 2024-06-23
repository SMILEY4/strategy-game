package io.github.smiley4.strategygame.backend.worlds.module.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.utils.COUNTRY_COLORS
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.Player
import io.github.smiley4.strategygame.backend.commondata.PlayerState
import io.github.smiley4.strategygame.backend.worlds.edge.JoinGame
import io.github.smiley4.strategygame.backend.worlds.module.client.InitializePlayer
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameQuery
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameUpdate


internal class JoinGameImpl(
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
            throw JoinGame.GameNotFoundError()
        }
    }


    /**
     * Validate whether the given user can join the given game. Return nothing or an [UserAlreadyJoinedError]
     */
    private fun validate(game: Game, userId: String) {
        if (game.players.existsByUserId(userId)) {
            log().warn("User has $userId already joined game ${game.gameId}")
            throw JoinGame.UserAlreadyJoinedError()
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