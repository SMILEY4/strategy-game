package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.Province


internal class ProvincePOVBuilder(private val povCache: POVCache) {

    fun build(province: Province): JsonType? {
        val knownSettlements = province.settlementIds.filter { povCache.settlementVisibility(it).isAtLeast(TileVisibilityDTO.DISCOVERED) }
        if(knownSettlements.isEmpty()) {
            return null
        }
        return obj {
            "id" to province.provinceId
            "settlements" to knownSettlements
        }
    }

}