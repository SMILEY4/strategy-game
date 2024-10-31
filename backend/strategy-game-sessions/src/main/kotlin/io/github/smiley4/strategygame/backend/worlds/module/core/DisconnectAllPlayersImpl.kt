package io.github.smiley4.strategygame.backend.worlds.module.core

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.worlds.edge.DisconnectAllPlayers
import io.github.smiley4.strategygame.backend.worlds.edge.DisconnectPlayer
import io.github.smiley4.strategygame.backend.worlds.module.persistence.UsersConnectedToGamesQuery


internal class DisconnectAllPlayersImpl(
    private val queryConnectedUsers: UsersConnectedToGamesQuery,
    private val disconnect: DisconnectPlayer
) : DisconnectAllPlayers {

    private val metricId = MetricId.action(DisconnectAllPlayers::class)

    override suspend fun perform() {
        time(metricId) {
            queryConnectedUsers.execute()
                .forEach { disconnect.perform(it) }
        }
    }

}