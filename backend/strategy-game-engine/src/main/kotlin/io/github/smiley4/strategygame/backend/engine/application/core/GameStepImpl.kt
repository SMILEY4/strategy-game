package io.github.smiley4.strategygame.backend.engine.application.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.engine.application.core.commandexecution.MoveCommandExecutor
import io.github.smiley4.strategygame.backend.engine.ports.provided.GameStep


internal class GameStepImpl(
    val moveCommandExecutor: MoveCommandExecutor,
) : GameStep, Logging {

    private val metricId = MetricId.action(GameStep::class)

    override suspend fun perform(game: GameState, commands: Collection<Command<*>>) {
        return time(metricId) {
            log().info("Performing game step for game ${game.game.id} and turn ${game.game.turn}")
            executeCommands(game, commands)
            prepareNextTurn(game)
        }
    }

    private fun executeCommands(game: GameState, commands: Collection<Command<*>>) {
        commands.forEach {
            try {
                @Suppress("UNCHECKED_CAST")
                when (it.data) {
                    is CommandData.Move -> moveCommandExecutor.execute(game, it as Command<CommandData.Move>)
                }
            } catch (e: Exception) {
                log().error("Error when executing command", e)
            }
        }
    }

    private fun prepareNextTurn(game: GameState) {
        game.game.turn += 1
    }

}