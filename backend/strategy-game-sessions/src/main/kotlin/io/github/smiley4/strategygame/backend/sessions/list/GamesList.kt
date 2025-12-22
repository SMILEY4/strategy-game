package io.github.smiley4.strategygame.backend.sessions.list

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.commondata.User


class GamesList(
    private val gameDbQuery: GameDbQueryByUser,
) : Logging {

    private val metricId = MetricId.action(GamesList::class)

    suspend fun list(userId: User.Id): List<Game> {
        return time(metricId) {
            log().info("Listing all game-ids of user $userId")
            gameDbQuery.query(userId)
        }
    }

}