package de.ruegnerlukas.strategygame.backend.gamesession.core

import arrow.core.Either
import arrow.core.continuations.either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameRequestConnectionAction.AlreadyConnectedError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameRequestConnectionAction.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameRequestConnectionAction.GameRequestConnectionActionError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameRequestConnectionAction.NotParticipantError
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameQuery
import de.ruegnerlukas.strategygame.backend.common.Logging
import de.ruegnerlukas.strategygame.backend.common.models.Game

class GameRequestConnectionActionImpl(
    private val gameQuery: GameQuery,
) : GameRequestConnectionAction, Logging {

    private val metricId = metricCoreAction(GameRequestConnectionAction::class)

    override suspend fun perform(userId: String, gameId: String): Either<GameRequestConnectionActionError, Unit> {
        return Monitoring.coTime(metricId) {
            log().info("Requesting to connect to game $gameId as user $userId")
            either {
                val game = findGame(gameId).bind()
                validatePlayer(game, userId).bind()
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
    private fun validatePlayer(game: Game, userId: String): Either<GameRequestConnectionActionError, Unit> {
        val player = game.players.findByUserId(userId)
        if (player != null) {
            if (player.connectionId == null) {
                return Unit.right()
            } else {
                return AlreadyConnectedError.left()
            }
        } else {
            return NotParticipantError.left()
        }
    }

}