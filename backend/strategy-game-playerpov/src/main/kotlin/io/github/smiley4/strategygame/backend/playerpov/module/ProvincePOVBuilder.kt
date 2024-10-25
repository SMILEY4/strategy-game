package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.Province


internal class ProvincePOVBuilder(private val povCache: POVCache) {

    fun build(province: Province): JsonType? {
        val knownSettlements = province.settlements
            .filter { povCache.settlementVisibility(it).isAtLeast(TileVisibilityDTO.DISCOVERED) }
            .map { it.value }
        if(knownSettlements.isEmpty()) {
            return null
        }
        return obj {
            "id" to province.id.value
            "color" to obj {
                "red" to province.color.red
                "green" to province.color.green
                "blue" to province.color.blue
            }
            "settlements" to knownSettlements
        }
    }

}