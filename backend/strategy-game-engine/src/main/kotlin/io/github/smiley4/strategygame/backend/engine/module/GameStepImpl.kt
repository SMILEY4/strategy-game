package io.github.smiley4.strategygame.backend.engine.module

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.engine.edge.GameStep
import io.github.smiley4.strategygame.backend.engine.module.core.common.GameEventSystem
import io.github.smiley4.strategygame.backend.engine.module.core.events.RootStepEvent


internal class GameStepImpl(
    private var eventSystem: GameEventSystem
) : GameStep, Logging {

    private val metricId = MetricId.action(GameStep::class)

    override suspend fun perform(game: GameExtended, commands: Collection<Command<*>>) {
        return time(metricId) {
            log().info("Performing game step for game ${game.meta.id} and turn ${game.meta.turn}")
            updateState(game, commands)
            prepareNextTurn(game)
        }
    }

    private fun updateState(game: GameExtended, commands: Collection<Command<*>>) {
        eventSystem.publish(RootStepEvent(game, commands))
    }

    private fun prepareNextTurn(game: GameExtended) {
        game.meta.turn += 1
    }

}