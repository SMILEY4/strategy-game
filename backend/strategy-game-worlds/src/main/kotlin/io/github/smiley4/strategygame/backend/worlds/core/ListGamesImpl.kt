package io.github.smiley4.strategygame.backend.worlds.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.common.models.GameSessionData
import io.github.smiley4.strategygame.backend.worlds.ports.provided.ListGames
import io.github.smiley4.strategygame.backend.worlds.ports.required.GamesByUserQuery


class ListGamesImpl(
    private val gamesByUserQuery: GamesByUserQuery
) : ListGames, Logging {

    private val metricId = MetricId.action(ListGames::class)

    override suspend fun perform(userId: String): List<GameSessionData> {
        return time(metricId) {
            log().info("Listing all game-ids of user $userId")
            getGames(userId)
        }
    }

    /**
     * Find all games with the given user as a player
     */
    private suspend fun getGames(userId: String): List<GameSessionData> {
        return gamesByUserQuery.execute(userId).map { GameSessionData(
            id = it.gameId,
            name = it.name,
            creationTimestamp = it.creationTimestamp,
            players = it.players.size,
            currentTurn = it.turn
        ) }
    }

}