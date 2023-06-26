package de.ruegnerlukas.strategygame.backend.gamesession.core

import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.ListGames
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GamesByUserQuery

class ListGamesImpl(
    private val gamesByUserQuery: GamesByUserQuery
) : ListGames, Logging {

    private val metricId = metricCoreAction(ListGames::class)

    override suspend fun perform(userId: String): List<String> {
        return Monitoring.coTime(metricId) {
            log().info("Listing all game-ids of user $userId")
            getGameIds(userId)
        }
    }

    /**
     * Find all games with the given user as a player and return the ids
     */
    private suspend fun getGameIds(userId: String): List<String> {
        return gamesByUserQuery.execute(userId).map { it.gameId }
    }

}