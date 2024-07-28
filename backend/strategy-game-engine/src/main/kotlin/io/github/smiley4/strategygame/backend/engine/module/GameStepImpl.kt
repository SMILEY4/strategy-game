package io.github.smiley4.strategygame.backend.engine.module

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId
import io.github.smiley4.strategygame.backend.common.monitoring.Monitoring.time
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.MoveCommandData
import io.github.smiley4.strategygame.backend.commondata.ref
import io.github.smiley4.strategygame.backend.engine.edge.GameStep


class GameStepImpl : GameStep, Logging {

    private val metricId = MetricId.action(GameStep::class)

    override suspend fun perform(game: GameExtended, commands: Collection<Command<*>>) {
        return time(metricId) {
            updateState(game, commands)
            prepareNextTurn(game)
        }
    }

    private fun updateState(game: GameExtended, commands: Collection<Command<*>>) {
        // todo: temporary prototype code:
        commands.forEach { cmd ->
            when(val cmdData = cmd.data) {
                is MoveCommandData -> {
                    val worldObject = game.worldObjects.find { it.id == cmdData.worldObjectId }!!
                    worldObject.tile = game.tiles.find { it.tileId == cmdData.path.last().id }!!.ref()
                }
            }
        }

    }

    private fun prepareNextTurn(game: GameExtended) {
        game.meta.turn += 1
    }

}