package io.github.smiley4.strategygame.backend.playerpov.application.builders

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.Route
import io.github.smiley4.strategygame.backend.playerpov.application.POVCache
import io.github.smiley4.strategygame.backend.playerpov.application.TileVisibilityDTO
import io.github.smiley4.strategygame.backend.playerpov.application.hidden
import io.github.smiley4.strategygame.backend.playerpov.application.isAtLeast
import io.github.smiley4.strategygame.backend.playerpov.application.isLessThan

internal class RoutePovBuilder(private val povCache: POVCache) {

    fun build(route: Route): JsonType? {
        val visibilityWorldObjectA = povCache.worldObjectVisibility(route.worldObjectA)
        val visibilityWorldObjectB = povCache.worldObjectVisibility(route.worldObjectB)

        if (visibilityWorldObjectA.isLessThan(TileVisibilityDTO.DISCOVERED) && visibilityWorldObjectB.isLessThan(TileVisibilityDTO.DISCOVERED)) {
            return null
        }

        return obj {
            "id" to route.id.value
            "cost" to route.cost
            "worldObjectA" to hidden(visibilityWorldObjectA.isAtLeast(TileVisibilityDTO.DISCOVERED)) {
                route.worldObjectA.value
            }
            "worldObjectB" to hidden(visibilityWorldObjectB.isAtLeast(TileVisibilityDTO.DISCOVERED)) {
                route.worldObjectB.value
            }
            "path" to route.path.map { povCache.tileIdentifier(it.id) }
        }
    }

}