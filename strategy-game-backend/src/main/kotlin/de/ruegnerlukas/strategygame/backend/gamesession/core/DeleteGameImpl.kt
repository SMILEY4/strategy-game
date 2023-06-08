package de.ruegnerlukas.strategygame.backend.gamesession.core

import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameDeleteAction
import de.ruegnerlukas.strategygame.backend.common.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.common.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.GameDelete
import de.ruegnerlukas.strategygame.backend.common.Logging

class GameDeleteActionImpl(private val gameDelete: GameDelete) : GameDeleteAction, Logging {

    private val metricId = metricCoreAction(GameDeleteAction::class)

    override suspend fun perform(gameId: String) {
        Monitoring.coTime(metricId) {
            log().info("Deleting game $gameId")
            gameDelete.execute(gameId)
        }
    }

}