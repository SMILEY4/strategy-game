package io.github.smiley4.strategygame.backend.worlds.module.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.worlds.module.core.provided.DeleteGame
import io.github.smiley4.strategygame.backend.worlds.module.core.required.GameDelete


class DeleteGameImpl(private val gameDelete: GameDelete) : DeleteGame, Logging {

    private val metricId = MetricId.action(DeleteGame::class)

    override suspend fun perform(gameId: String) {
        time(metricId) {
            log().info("Deleting game $gameId")
            gameDelete.execute(gameId)
        }
    }

}