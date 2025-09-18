package io.github.smiley4.strategygame.backend.engine.application.core

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.GameState
import io.github.smiley4.strategygame.backend.engine.application.core.commandexecution.ConstructTileImprovementCommandExecutor
import io.github.smiley4.strategygame.backend.engine.application.core.commandexecution.DisbandCommandExecutor
import io.github.smiley4.strategygame.backend.engine.application.core.commandexecution.MoveCommandExecutor
import io.github.smiley4.strategygame.backend.engine.application.core.commandexecution.SpawnSettlementCommandExecutor
import io.github.smiley4.strategygame.backend.engine.ports.provided.GameStep


internal class GameStepImpl(
    val moveCmdExecutor: MoveCommandExecutor,
    val disbandCmdExecutor: DisbandCommandExecutor,
    val constructImprovementCmdExecutor: ConstructTileImprovementCommandExecutor,
    val spawnSettlementCmdExecutor: SpawnSettlementCommandExecutor,
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
                    is CommandData.Move -> moveCmdExecutor.execute(game, it as Command<CommandData.Move>)
                    is CommandData.Disband -> disbandCmdExecutor.execute(game, it as Command<CommandData.Disband>)
                    is CommandData.ConstructTileImprovement -> constructImprovementCmdExecutor.execute(game, it as Command<CommandData.ConstructTileImprovement>)
                    is CommandData.SpawnSettlement -> spawnSettlementCmdExecutor.execute(game, it as Command<CommandData.SpawnSettlement>)
                }
            } catch (e: Exception) {
                log().error("Error when executing command (->ignoring)", e)
            }
        }
    }

    private fun prepareNextTurn(game: GameState) {
        game.game.turn += 1
    }

}