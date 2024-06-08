package io.github.smiley4.strategygame.backend.worlds.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.persistence.EntityNotFoundError
import io.github.smiley4.strategygame.backend.common.models.Game
import io.github.smiley4.strategygame.backend.worlds.ports.provided.RequestConnectionToGame
import io.github.smiley4.strategygame.backend.worlds.ports.required.GameQuery


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
            throw RequestConnectionToGame.GameNotFoundError()
        }
    }


    /**
     * Validate whether the given user can connect to the given game. Return nothing or an [GameRequestConnectionActionError]
     */
    private fun validate(game: Game, userId: String) {
        val player = game.players.findByUserId(userId)
        if (player == null) {
            throw RequestConnectionToGame.NotParticipantError()
        }
        if (player.connectionId != null) {
            throw RequestConnectionToGame.AlreadyConnectedError()
        }
    }

}