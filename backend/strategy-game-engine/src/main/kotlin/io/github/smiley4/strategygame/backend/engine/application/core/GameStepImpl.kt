package io.github.smiley4.strategygame.backend.engine.application.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.engine.application.core.process.events.RootEvent
import io.github.smiley4.strategygame.backend.engine.application.core.process.system.ProcessEventPublisher
import io.github.smiley4.strategygame.backend.engine.ports.provided.GameStep


internal class GameStepImpl(
    private var publisher: ProcessEventPublisher,
) : GameStep, Logging {

    private val metricId = MetricId.action(GameStep::class)

    override suspend fun perform(game: GameExtended, commands: Collection<Command<*>>) {
        return time(metricId) {
            log().info("Performing game step for game ${game.meta.id} and turn ${game.meta.turn}")
            updateState(game, commands)
            prepareNextTurn(game)
        }
    }

    private suspend fun updateState(game: GameExtended, commands: Collection<Command<*>>) {
        publisher.publish(RootEvent(game, commands))
    }

    private fun prepareNextTurn(game: GameExtended) {
        game.meta.turn += 1
    }

}