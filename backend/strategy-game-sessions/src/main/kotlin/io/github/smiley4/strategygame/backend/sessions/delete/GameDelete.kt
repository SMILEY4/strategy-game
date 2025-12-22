package io.github.smiley4.strategygame.backend.sessions.delete

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.DocumentNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game

class GameDelete(private val gameDbDelete: GameDbDelete) : Logging {

    private val metricId = MetricId.action(GameDelete::class)

    suspend fun delete(game: Game.Id) {
        time(metricId) {
            log().info("Deleting game $game")
            try {
                gameDbDelete.delete(game)
            } catch (e: DocumentNotFoundError) {
                log().info("No game with id $game found to delete.")
            }
        }
    }

}