package io.github.smiley4.strategygame.backend.sessions.application.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commonarangodb.DocumentNotFoundError
import io.github.smiley4.strategygame.backend.commondata.Game
import io.github.smiley4.strategygame.backend.sessions.application.persistence.GameDelete
import io.github.smiley4.strategygame.backend.sessions.ports.provided.DeleteGame


internal class DeleteGameImpl(private val gameDelete: GameDelete) : DeleteGame, Logging {

    private val metricId = MetricId.action(DeleteGame::class)

    override suspend fun perform(game: Game.Id) {
        time(metricId) {
            log().info("Deleting game $game")
            try {
                gameDelete.execute(game)
            } catch (e: DocumentNotFoundError) {
                log().info("No game with id $game found to delete.")
            }
        }
    }

}