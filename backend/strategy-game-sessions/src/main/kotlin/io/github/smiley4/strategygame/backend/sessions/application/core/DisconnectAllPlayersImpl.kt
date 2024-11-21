package io.github.smiley4.strategygame.backend.sessions.application.core

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.sessions.application.persistence.UsersConnectedToGamesQuery
import io.github.smiley4.strategygame.backend.sessions.ports.provided.DisconnectAllPlayers
import io.github.smiley4.strategygame.backend.sessions.ports.provided.DisconnectPlayer


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