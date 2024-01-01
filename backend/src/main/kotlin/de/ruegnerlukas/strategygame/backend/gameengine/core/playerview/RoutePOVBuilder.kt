package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import com.lectra.koson.ObjectType
import com.lectra.koson.obj
import de.ruegnerlukas.strategygame.backend.common.utils.arrMap
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Route

class RoutePOVBuilder(
    private val dtoCache: POVCache,
    private val cities: List<City>
) {


    fun build(route: Route): ObjectType? {
        if(!shouldInclude(route)) {
            return null
        }
        return obj {
            "routeId" to route.routeId
            "cityA" to dtoCache.cityIdentifier(route.cityIdA)
            "cityB" to dtoCache.cityIdentifier(route.cityIdB)
            "path" to arrMap[route.path, {tile ->
                obj {
                    "tileId" to tile.tileId
                    "q" to tile.q
                    "r" to tile.r
                }
            }]
        }
    }

    private fun shouldInclude(route: Route): Boolean {
        val visCityA = dtoCache.tileVisibility(cities.find { it.cityId == route.cityIdA }!!.tile.tileId)
        val visCityB = dtoCache.tileVisibility(cities.find { it.cityId == route.cityIdA }!!.tile.tileId)
        return visCityA.isAtLeast(VisibilityDTO.DISCOVERED) && visCityB.isAtLeast(VisibilityDTO.DISCOVERED)
    }

}