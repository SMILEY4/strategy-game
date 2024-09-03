package io.github.smiley4.strategygame.backend.engine.module.core.steps

import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.Id
import io.github.smiley4.strategygame.backend.commondata.Command
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueAddEntryCommandData
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueRemoveEntryCommandData

internal class ResolveCommandProductionQueue : Logging {

    @JvmName("resolveRemove")
    fun resolve(game: GameExtended, command: Command<ProductionQueueRemoveEntryCommandData>) {
        log().debug("Resolving remove production queue entry ${command.data.entryId}")
        val settlement = game.findSettlement(command.data.settlementId)
        settlement.productionQueue.removeIf { it.entryId == command.data.entryId }
    }


    @JvmName("resolveAdd")
    fun resolve(game: GameExtended, command: Command<ProductionQueueAddEntryCommandData>) {
        log().debug("Resolving add production queue entry in settlement ${command.data.settlementId}")
        val settlement = game.findSettlement(command.data.settlementId)
        when (command.data) {
            is ProductionQueueAddEntryCommandData.Settler -> {
                settlement.productionQueue.add(
                    ProductionQueueEntry.Settler(
                        entryId = Id.gen(),
                        progress = 0f
                    )
                )
            }
        }
    }

}