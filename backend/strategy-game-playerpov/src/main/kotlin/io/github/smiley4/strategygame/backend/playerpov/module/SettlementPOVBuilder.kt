package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.Settlement


internal class SettlementPOVBuilder(private val povCache: POVCache) {

    fun build(settlement: Settlement): JsonType? {
        val visibility = povCache.settlementVisibility(settlement.id)
        if (visibility.isLessThan(TileVisibilityDTO.DISCOVERED)) {
            return null
        }
        return obj {
            "id" to settlement.id.value
            "color" to obj {
                "red" to settlement.attributes.color.red
                "green" to settlement.attributes.color.green
                "blue" to settlement.attributes.color.blue
            }
            "name" to settlement.attributes.name
            "country" to settlement.country.value
            "tile" to obj {
                "id" to settlement.tile.id.value
                "q" to settlement.tile.q
                "r" to settlement.tile.r
            }
            "productionQueue" to objHidden(visibility.isAtLeast(TileVisibilityDTO.VISIBLE)) {
                settlement.infrastructure.productionQueue.map {
                    when (it) {
                        is ProductionQueueEntry.Settler -> obj {
                            "type" to "settler"
                            "entryId" to it.id.value
                            "progress" to it.progress
                        }
                    }
                }
            }
            "buildings" to objHidden(visibility.isAtLeast(TileVisibilityDTO.VISIBLE)) {
                settlement.infrastructure.buildings.map {
                    obj {
                        "type" to it.type.name
                        // todo ...
                    }
                }
            }
        }
    }

}