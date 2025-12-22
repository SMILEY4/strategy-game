package io.github.smiley4.strategygame.backend.sessions.disconnectall

import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.sessions.disconnectplayer.GameDisconnectPlayer

class GameDisconnectAll(
    private val gameDbQueryConnectedUsers: GameDbQueryConnectedUsers,
    private val disconnectPlayer: GameDisconnectPlayer
) {

    private val metricId = MetricId.action(GameDisconnectAll::class)

    suspend fun disconnect() {
        time(metricId) {
            gameDbQueryConnectedUsers.query()
                .forEach { disconnectPlayer.disconnect(it) }
        }
    }

}