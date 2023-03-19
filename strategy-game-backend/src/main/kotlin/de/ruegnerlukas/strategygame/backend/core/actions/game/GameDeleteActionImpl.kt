package de.ruegnerlukas.strategygame.backend.core.actions.game

import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameDeleteAction
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricCoreAction
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