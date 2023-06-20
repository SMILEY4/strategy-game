package de.ruegnerlukas.strategygame.backend.gamesession.core

import arrow.core.Either
import arrow.core.continuations.either
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.Game
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.common.utils.err
import de.ruegnerlukas.strategygame.backend.common.utils.ok
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.RequestConnectionToGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.RequestConnectionToGame.AlreadyConnectedError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.RequestConnectionToGame.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.RequestConnectionToGame.GameRequestConnectionActionError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.RequestConnectionToGame.NotParticipantError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameQuery

class RequestConnectionToGameImpl(
    private val gameQuery: GameQuery,
) : RequestConnectionToGame, Logging {

    private val metricId = metricCoreAction(RequestConnectionToGame::class)

    override suspend fun perform(userId: String, gameId: String): Either<GameRequestConnectionActionError, Unit> {
        return Monitoring.coTime(metricId) {
            log().info("Requesting to connect to game $gameId as user $userId")
            either {
                val game = findGame(gameId).bind()
                validate(game, userId).bind()
            }
        }
    }


    /**
     * Find and return the game or an [GameNotFoundError] if the game does not exist
     */
    private suspend fun findGame(gameId: String): Either<GameNotFoundError, Game> {
        return gameQuery.execute(gameId).mapLeft { GameNotFoundError }
    }


    /**
     * Validate whether the given user can connect to the given game. Return nothing or an [GameRequestConnectionActionError]
     */
    private fun validate(game: Game, userId: String): Either<GameRequestConnectionActionError, Unit> {
        val player = game.players.findByUserId(userId)
        if (player == null) {
            return NotParticipantError.err()
        }
        if (player.connectionId != null) {
            return AlreadyConnectedError.err()
        }
        return Unit.ok()
    }

}