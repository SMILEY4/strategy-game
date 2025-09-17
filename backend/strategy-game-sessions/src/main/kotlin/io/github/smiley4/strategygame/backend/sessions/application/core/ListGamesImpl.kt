package io.github.smiley4.strategygame.backend.sessions.application.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.sessions.application.persistence.GamesByUserQuery
import io.github.smiley4.strategygame.backend.sessions.ports.provided.ListGames


internal class ListGamesImpl(
    private val gamesByUserQuery: GamesByUserQuery
) : ListGames, Logging {

    private val metricId = MetricId.action(ListGames::class)

    override suspend fun perform(userId: User.Id): List<Game> {
        return time(metricId) {
            log().info("Listing all game-ids of user $userId")
            gamesByUserQuery.execute(userId)
        }
    }

}