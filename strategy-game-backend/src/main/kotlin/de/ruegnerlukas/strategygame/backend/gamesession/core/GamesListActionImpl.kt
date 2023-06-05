package de.ruegnerlukas.strategygame.backend.gamesession.core

import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GamesListAction
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GamesByUserQuery
import de.ruegnerlukas.strategygame.backend.common.Logging

class GamesListActionImpl(
    private val gamesByUserQuery: GamesByUserQuery
) : GamesListAction, Logging {

    private val metricId = metricCoreAction(GamesListAction::class)

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