package io.github.smiley4.strategygame.backend.worlds.module.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commondata.GameSessionData
import io.github.smiley4.strategygame.backend.commondata.User
import io.github.smiley4.strategygame.backend.worlds.edge.ListGames
import io.github.smiley4.strategygame.backend.worlds.module.persistence.GamesByUserQuery


internal class ListGamesImpl(
    private val gamesByUserQuery: GamesByUserQuery
) : ListGames, Logging {

    private val metricId = MetricId.action(ListGames::class)

    override suspend fun perform(userId: User.Id): List<GameSessionData> {
        return time(metricId) {
            log().info("Listing all game-ids of user $userId")
            gamesByUserQuery.execute(userId).map {
                GameSessionData(
                    game = it.id,
                    name = it.name,
                    creationTimestamp = it.creationTimestamp,
                    players = it.players.size,
                    currentTurn = it.turn
                )
            }
        }
    }

}