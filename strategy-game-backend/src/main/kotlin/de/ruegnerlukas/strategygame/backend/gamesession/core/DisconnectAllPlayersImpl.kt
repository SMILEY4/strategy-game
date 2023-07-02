package de.ruegnerlukas.strategygame.backend.gamesession.core

import de.ruegnerlukas.strategygame.backend.common.monitoring.MetricId
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring.time
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DisconnectAllPlayers
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DisconnectFromGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.UsersConnectedToGamesQuery

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