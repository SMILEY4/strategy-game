package de.ruegnerlukas.strategygame.backend.gamesession.core

import de.ruegnerlukas.strategygame.backend.gamesession.ports.provided.GameDeleteAction
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.monitoring.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.GameDelete
import de.ruegnerlukas.strategygame.backend.shared.Logging

class GameDeleteActionImpl(private val gameDelete: GameDelete) : GameDeleteAction, Logging {

    private val metricId = metricCoreAction(GameDeleteAction::class)

    override suspend fun perform(gameId: String) {
        Monitoring.coTime(metricId) {
            log().info("Deleting game $gameId")
            gameDelete.execute(gameId)
        }
    }

}