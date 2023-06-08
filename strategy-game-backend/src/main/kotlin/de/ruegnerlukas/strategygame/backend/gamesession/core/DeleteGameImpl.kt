package de.ruegnerlukas.strategygame.backend.gamesession.core

import de.ruegnerlukas.strategygame.backend.common.Logging
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.DeleteGame
import de.ruegnerlukas.strategygame.backend.gamesession.ports.required.GameDelete

class DeleteGameImpl(private val gameDelete: GameDelete) : DeleteGame, Logging {

    private val metricId = metricCoreAction(DeleteGame::class)

    override suspend fun perform(gameId: String) {
        Monitoring.coTime(metricId) {
            log().info("Deleting game $gameId")
            gameDelete.execute(gameId)
        }
    }

}