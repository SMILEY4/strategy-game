package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.common.utils.containedIn
import io.github.smiley4.strategygame.backend.common.utils.notContainedIn
import io.github.smiley4.strategygame.backend.commondata.Route


internal class  RoutePOVBuilder(
    private val povCache: POVCache,
) {

    fun build(route: Route): JsonType? {
        if (route.cityIdA.notContainedIn(povCache.knownCities()) && route.cityIdB.notContainedIn(povCache.knownCities())) {
            return null
        }
        return obj {
            "id" to route.routeId
            "cityA" to objHidden(route.cityIdA.containedIn(povCache.knownCities())) {
                route.cityIdA
            }
            "cityB" to objHidden(route.cityIdB.containedIn(povCache.knownCities())) {
                route.cityIdB
            }
            "path" to route.path
                .filter { povCache.tileVisibility(it.id) !== TileVisibilityDTO.UNKNOWN }
                .map { tile ->
                    obj {
                        "id" to tile.id
                        "q" to tile.q
                        "r" to tile.r
                    }
                }
        }
    }

}