package io.github.smiley4.strategygame.backend.playerpov.application

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.Route


internal class RoutePOVBuilder(private val povCache: POVCache) {

    fun build(route: Route): JsonType? {

        val visibilityA = povCache.settlementVisibility(route.settlementA)
        val visibilityB = povCache.settlementVisibility(route.settlementB)
        if (visibilityA.isLessThan(TileVisibilityDTO.DISCOVERED) && visibilityB.isLessThan(TileVisibilityDTO.DISCOVERED)) {
            return null
        }

        return obj {
            "id" to route.id.value
            "settlementA" to route.settlementA.value
            "settlementB" to route.settlementB.value
            "path" to route.path.map {
                obj {
                    "id" to it.id.value
                    "q" to it.q
                    "r" to it.r
                }
            }
        }
    }

}