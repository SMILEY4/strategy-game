package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.Settlement


internal class SettlementPOVBuilder(private val povCache: POVCache) {

    fun build(settlement: Settlement): JsonType? {
        if (povCache.tileVisibility(settlement.tile.id).isLessThan(TileVisibilityDTO.DISCOVERED)) {
            return null
        }
        return obj {
            "id" to settlement.settlementId
            "country" to settlement.countryId
            "tile" to obj {
                "id" to settlement.tile.id
                "q" to settlement.tile.q
                "r" to settlement.tile.r
            }
            "name" to settlement.name
        }
    }

}