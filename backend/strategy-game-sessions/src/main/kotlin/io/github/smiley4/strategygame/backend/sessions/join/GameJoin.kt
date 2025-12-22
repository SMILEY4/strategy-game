package io.github.smiley4.strategygame.backend.sessions.join

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.Player
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.engine.ports.provided.InitializePlayer

internal class GameJoin(
    private val gameDbQuery: GameDbQuery,
    private val gameDbUpdate: GameDbUpdate,
    private val gameDbStateQuery: GameDbStateQuery,
    private val gameDbStateUpdate: GameDbStateUpdate,
    private val initializePlayer: InitializePlayer
) : Logging {

    private val metricId = MetricId.action(GameJoin::class)


    suspend fun join(userId: User.Id, gameId: Game.Id) {
        return time(metricId) {
            log().info("Joining game $gameId as user $userId")
            val game = findGame(gameId)
            validate(game, userId)
            createPlayer(game, userId)
            initializePlayer(game, userId)
        }
    }


    /**
     * Find and return the game with the given id or an [GameJoinError.GameNotFoundError] if the game does not exist
     */
    private suspend fun findGame(gameId: Game.Id): Game {
        try {
            return gameDbQuery.query(gameId)
        } catch (e: EntityNotFoundError) {
            throw GameJoinError.GameNotFoundError(e)
        }
    }


    /**
     * Validate whether the given user can join the given game. Return nothing or an [GameJoinError.UserAlreadyJoinedError]
     */
    private fun validate(game: Game, userId: User.Id) {
        if (game.players.existsByUserId(userId)) {
            log().warn("User has $userId already joined game ${game.id}")
            throw GameJoinError.UserAlreadyJoinedError()
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
                state = Player.State.PLAYING,
            )
        )
        gameDbUpdate.update(game)
    }


    /**
     * Create the necessary data in the game-world
     */
    private suspend fun initializePlayer(game: Game, userId: User.Id) {
        val gameExtended = gameDbStateQuery.query(game.id)
        try {
            initializePlayer.perform(gameExtended, userId)
        } catch (e: InitializePlayer.InitializePlayerError) {
            when (e) {
                is InitializePlayer.GameNotFoundError -> throw GameJoinError.InitializePlayerError(e)
            }
        }
        gameDbStateUpdate.update(gameExtended)
    }

}