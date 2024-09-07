package io.github.smiley4.strategygame.backend.engine.module.core.steps

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.gen
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry

internal class ResolveCommandProductionQueue : Logging {

    @JvmName("resolveRemove")
    fun resolve(game: GameExtended, command: Command<CommandData.ProductionQueueRemoveEntry>) {
        log().debug("Resolving remove production queue entry ${command.data.entry}")
        val settlement = game.findSettlement(command.data.settlement)
        settlement.infrastructure.productionQueue.removeIf { it.id == command.data.entry }
    }


    @JvmName("resolveAdd")
    fun resolve(game: GameExtended, command: Command<CommandData.ProductionQueueAddEntry>) {
        log().debug("Resolving add production queue entry in settlement ${command.data.settlement}")
        val settlement = game.findSettlement(command.data.settlement)
        when (command.data) {
            is CommandData.ProductionQueueAddEntry.Settler -> {
                settlement.infrastructure.productionQueue.add(
                    ProductionQueueEntry.Settler(
                        id = ProductionQueueEntry.Id.gen(),
                        progress = 0f
                    )
                )
            }
        }
    }

}