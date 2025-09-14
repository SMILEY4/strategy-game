package io.github.smiley4.strategygame.backend.engine.application.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.engine.ports.provided.GameStep


internal class GameStepImpl(
) : GameStep, Logging {

    private val metricId = MetricId.action(GameStep::class)

    override suspend fun perform(game: GameState, commands: Collection<Command<*>>) {
        return time(metricId) {
            log().info("Performing game step for game ${game.game.id} and turn ${game.game.turn}")
            prepareNextTurn(game)
        }
    }

    private fun prepareNextTurn(game: GameState) {
        game.game.turn += 1
    }

}