package io.github.smiley4.strategygame.backend.worlds.module.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.EntityNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.worlds.edge.RequestConnectionToGame
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GameQuery


internal class RequestConnectionToGameImpl(
    private val gameQuery: GameQuery,
) : RequestConnectionToGame, Logging {

    private val metricId = MetricId.action(RequestConnectionToGame::class)

    override suspend fun perform(userId: String, gameId: String) {
        return time(metricId) {
            log().info("Requesting to connect to game $gameId as user $userId")
            val game = getGame(gameId)
            validate(game, userId)
        }
    }


    /**
     * Get the game by the given id or throw
     */
    private suspend fun getGame(gameId: String): Game {
        try {
            return gameQuery.execute(gameId)
        } catch (e: EntityNotFoundError) {
            throw RequestConnectionToGame.GameNotFoundError(e)
        }
    }


    /**
     * Validate whether the given user can connect to the given game. Throw if validation failed.
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