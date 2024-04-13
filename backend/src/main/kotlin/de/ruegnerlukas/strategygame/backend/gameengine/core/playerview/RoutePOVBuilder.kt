package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.common.jsondsl.JsonType
import de.ruegnerlukas.strategygame.backend.common.jsondsl.obj
import de.ruegnerlukas.strategygame.backend.common.utils.containedIn
import de.ruegnerlukas.strategygame.backend.common.utils.notContainedIn
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Route

class RoutePOVBuilder(
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
                .filter { povCache.tileVisibility(it.tileId) !== TileVisibilityDTO.UNKNOWN }
                .map { tile ->
                    obj {
                        "id" to tile.tileId
                        "q" to tile.q
                        "r" to tile.r
                    }
                }
        }
    }

}