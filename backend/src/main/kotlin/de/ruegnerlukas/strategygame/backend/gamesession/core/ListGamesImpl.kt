package de.ruegnerlukas.strategygame.backend.gamesession.core

import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.gamesession.ports.models.GameSessionData
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.ListGames
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GamesByUserQuery

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