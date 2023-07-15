package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Route
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.CityDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.RouteDTO

class RouteDTOCreator {

    fun shouldInclude(route: Route, cityDTOs: List<CityDTO>): Boolean {
        val cityA = cityDTOs.find { it.cityId == route.cityIdA }
        val cityB = cityDTOs.find { it.cityId == route.cityIdA }
        return cityA != null && cityB != null
    }

    fun build(route: Route): RouteDTO {
        return RouteDTO(
            routeId = route.routeId,
            cityIdA = route.cityIdA,
            cityIdB = route.cityIdB,
            path = route.path
        )
    }

}