package de.ruegnerlukas.strategygame.backend.gamesession.core

import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.Game
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.RequestConnectionToGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.RequestConnectionToGame.AlreadyConnectedError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.RequestConnectionToGame.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.RequestConnectionToGame.GameRequestConnectionActionError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.RequestConnectionToGame.NotParticipantError
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameQuery

class RequestConnectionToGameImpl(
    private val gameQuery: GameQuery,
) : RequestConnectionToGame, Logging {

    private val metricId = MetricId.action(RequestConnectionToGame::class)

    override suspend fun perform(userId: String, gameId: String) {
        return time(metricId) {
            log().info("Requesting to connect to game $gameId as user $userId")
            val game = findGame(gameId)
            validate(game, userId)
        }
    }


    /**
     * Find and return the game or an [GameNotFoundError] if the game does not exist
     */
    private suspend fun findGame(gameId: String): Game {
        try {
            return gameQuery.execute(gameId)
        } catch (e: EntityNotFoundError) {
            throw GameNotFoundError()
        }
    }


    /**
     * Validate whether the given user can connect to the given game. Return nothing or an [GameRequestConnectionActionError]
     */
    private fun validate(game: Game, userId: String) {
        val player = game.players.findByUserId(userId)
        if (player == null) {
            throw NotParticipantError()
        }
        if (player.connectionId != null) {
            throw AlreadyConnectedError()
        }
    }

}