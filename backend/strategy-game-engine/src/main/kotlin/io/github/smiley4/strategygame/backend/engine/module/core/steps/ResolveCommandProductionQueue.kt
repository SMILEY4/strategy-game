package io.github.smiley4.strategygame.backend.engine.module.core.steps

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.gen
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.CommandData
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.ResourceCollection

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
        val queueEntry = createProductionQueueEntry(command.data)
        settlement.infrastructure.productionQueue.add(queueEntry)
    }

    private fun createProductionQueueEntry(data: CommandData.ProductionQueueAddEntry): ProductionQueueEntry {
        return when (data) {
            is CommandData.ProductionQueueAddEntry.Settler -> {
                ProductionQueueEntry.Settler(
                    id = ProductionQueueEntry.Id.gen(),
                    collectedResources = ResourceCollection.empty()
                )
            }
            is CommandData.ProductionQueueAddEntry.Building -> {
                ProductionQueueEntry.Building(
                    id = ProductionQueueEntry.Id.gen(),
                    collectedResources = ResourceCollection.empty(),
                    building = data.building
                )
            }
        }
    }

}