package de.ruegnerlukas.strategygame.backend.gamesession.core

import arrow.core.Either
import arrow.core.continuations.either
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.common.utils.COUNTRY_COLORS
import de.ruegnerlukas.strategygame.backend.common.utils.err
import de.ruegnerlukas.strategygame.backend.common.utils.getOrThrow
import de.ruegnerlukas.strategygame.backend.common.utils.ok
import de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.InitializePlayer
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Game
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Player
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.PlayerState
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.JoinGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.JoinGame.GameJoinActionErrors
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


    override suspend fun perform(userId: String, gameId: String): Either<GameJoinActionErrors, Unit> {
        return time(metricId) {
            log().info("Joining game $gameId as user $userId)")
            either {
                val game = findGame(gameId).bind()
                validate(game, userId).bind()
                createPlayer(game, userId)
                initializePlayer(game, userId)
            }
        }
    }


    /**
     * Find and return the game with the given id or an [GameNotFoundError] if the game does not exist
     */
    private suspend fun findGame(gameId: String): Either<GameNotFoundError, Game> {
        return gameQuery.execute(gameId).mapLeft { GameNotFoundError }
    }


    /**
     * Validate whether the given user can join the given game. Return nothing or an [UserAlreadyJoinedError]
     */
    private fun validate(game: Game, userId: String): Either<UserAlreadyJoinedError, Unit> {
        return if (game.players.existsByUserId(userId)) {
            UserAlreadyJoinedError.err()
        } else {
            Unit.ok()
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
        initializePlayer.perform(game.gameId, userId, COUNTRY_COLORS[(game.players.size - 1) % COUNTRY_COLORS.size]).getOrThrow()
    }

}