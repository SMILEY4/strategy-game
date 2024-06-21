package io.github.smiley4.strategygame.backend.worlds.module.core

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.worlds.module.core.provided.DisconnectAllPlayers
import io.github.smiley4.strategygame.backend.worlds.module.core.provided.DisconnectFromGame
import io.github.smiley4.strategygame.backend.worlds.module.core.required.UsersConnectedToGamesQuery


class DisconnectAllPlayersImpl(
    private val queryConnectedUsers: UsersConnectedToGamesQuery,
    private val disconnect: DisconnectFromGame
) : DisconnectAllPlayers {

    private val metricId = MetricId.action(DisconnectAllPlayers::class)

    override suspend fun perform() {
        time(metricId) {
            getUserIds().forEach { userId ->
                disconnect.perform(userId)
            }
        }
    }

    private suspend fun getUserIds(): List<String> {
        return queryConnectedUsers.execute()
    }

}