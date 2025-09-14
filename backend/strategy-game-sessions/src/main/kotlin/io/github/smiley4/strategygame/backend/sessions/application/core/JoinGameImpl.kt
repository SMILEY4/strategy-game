package io.github.smiley4.strategygame.backend.sessions.application.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.Player
import io.github.smiley4.strategygame.backend.commondata.PlayerState
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.sessions.application.persistence.GameStateQuery
import io.github.smiley4.strategygame.backend.sessions.application.persistence.GameQuery
import io.github.smiley4.strategygame.backend.sessions.application.persistence.GameUpdate
import io.github.smiley4.strategygame.backend.sessions.ports.provided.JoinGame
import io.github.smiley4.strategygame.backend.sessions.ports.required.InitializePlayer


internal class JoinGameImpl(
    private val gameQuery: GameQuery,
    private val gameUpdate: GameUpdate,
    private val gameStateQuery: GameStateQuery,
    private val gameStateUpdate: io.github.smiley4.strategygame.backend.sessions.application.persistence.GameStateUpdate,
    private val initializePlayer: InitializePlayer
) : JoinGame, Logging {

    private val metricId = MetricId.action(JoinGame::class)


    override suspend fun perform(userId: User.Id, gameId: Game.Id) {
        return time(metricId) {
            log().info("Joining game $gameId as user $userId")
            val game = findGame(gameId)
            validate(game, userId)
            createPlayer(game, userId)
            initializePlayer(game, userId)
        }
    }

    /**
     * Find and return the game with the given id or an [JoinGame.GameNotFoundError] if the game does not exist
     */
    private suspend fun findGame(gameId: Game.Id): Game {
        try {
            return gameQuery.execute(gameId)
        } catch (e: EntityNotFoundError) {
            throw JoinGame.GameNotFoundError(e)
        }
    }


    /**
     * Validate whether the given user can join the given game. Return nothing or an [JoinGame.UserAlreadyJoinedError]
     */
    private fun validate(game: Game, userId: User.Id) {
        if (game.players.existsByUserId(userId)) {
            log().warn("User has $userId already joined game ${game.id}")
            throw JoinGame.UserAlreadyJoinedError()
        }
    }


    /**
     * Add the user as a player to the given game
     */
    private suspend fun createPlayer(game: Game, userId: User.Id) {
        game.players.add(
            Player(
                user = userId,
                connectionId = null,
                state = PlayerState.PLAYING,
            )
        )
        gameUpdate.execute(game)
    }


    /**
     * Create the necessary data in the game-world
     */
    private suspend fun initializePlayer(game: Game, userId: User.Id) {
        val gameExtended = gameStateQuery.execute(game.id)
        try {
            initializePlayer.perform(gameExtended, userId)
        } catch (e: InitializePlayer.InitializePlayerError) {
            when(e) {
                is InitializePlayer.GameNotFoundError -> throw JoinGame.InitializePlayerError(e)
            }
        }
        gameStateUpdate.execute(gameExtended)
    }

}