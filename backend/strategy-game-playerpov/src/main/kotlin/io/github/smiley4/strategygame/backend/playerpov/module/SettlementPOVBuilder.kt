package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.Settlement


internal class SettlementPOVBuilder(private val povCache: POVCache) {

    fun build(settlement: Settlement): JsonType? {
        val visibility = povCache.settlementVisibility(settlement.settlementId)
        if (visibility.isLessThan(TileVisibilityDTO.DISCOVERED)) {
            return null
        }
        return obj {
            "id" to settlement.settlementId
            "color" to obj {
                "red" to settlement.color.red
                "green" to settlement.color.green
                "blue" to settlement.color.blue
            }
            "name" to settlement.name
            "country" to settlement.countryId
            "tile" to obj {
                "id" to settlement.tile.id
                "q" to settlement.tile.q
                "r" to settlement.tile.r
            }
            "productionQueue" to objHidden(visibility.isAtLeast(TileVisibilityDTO.VISIBLE)) {
                settlement.productionQueue.map {
                    when (it) {
                        is ProductionQueueEntry.Settler -> obj {
                            "type" to "settler"
                            "entryId" to it.entryId
                            "progress" to it.progress
                        }
                    }
                }
            }
        }
    }

}