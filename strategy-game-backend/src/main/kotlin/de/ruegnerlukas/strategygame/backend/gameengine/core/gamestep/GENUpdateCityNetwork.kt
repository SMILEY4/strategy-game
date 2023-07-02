package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Province
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Route
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.common.utils.distance
import de.ruegnerlukas.strategygame.backend.common.utils.mapParallel
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.ReservationInsert
import de.ruegnerlukas.strategygame.backend.pathfinding.Path
import de.ruegnerlukas.strategygame.backend.pathfinding.Pathfinder

/**
 * Connects newly created cities with other cities
 */
class GENUpdateCityNetwork(
    private val gameConfig: GameConfig,
    private val reservationInsert: ReservationInsert,
    eventSystem: EventSystem
) : Logging {

    object Definition : BasicEventNodeDefinition<CreateCityResultData, Unit>()

    init {
        eventSystem.createNode(Definition) {
            trigger(GENCreateCity.Definition.after())
            action { data ->
                log().debug("Update city network after creation of city ${data.city.cityId}")
                val capitalCity = getCapitalCity(data.game, data.city, data.province)
                createOrUpdateRoutes(capitalCity, data.game)
                eventResultOk(Unit)
            }
        }
    }

    private fun getCapitalCity(game: GameExtended, city: City, province: Province): City {
        return if (city.isProvinceCapital) {
            city
        } else {
            province.findCapitalCity(game)
        }
    }

    private suspend fun createOrUpdateRoutes(city: City, game: GameExtended) {
        val pathfinder = buildCityNetworkPathfinder(game, gameConfig)
        game.cities
            .asSequence()
            .filter { canCreateRoute(city, it, game.routes, gameConfig.maxRouteLength) }
            .mapParallel { findPath(pathfinder, city, it, game) }
            .filter { isValidPath(it) }
            .forEach { (from, to, path) -> createOrUpdateRoute(from, to, path, game) }
    }

    private suspend fun createOrUpdateRoute(from: City, to: City, path: Path<CityNetworkNode>, game: GameExtended) {
        val existingRoute = existingRoute(from, to, game.routes)
        if (existingRoute == null) {
            game.routes.add(createRoute(from, to, path))
        } else {
            if (existingRoute.path.size > path.nodes.size) {
                game.routes.remove(existingRoute)
                game.routes.add(createRoute(from, to, path))
            }
        }
    }

    private fun canCreateRoute(a: City, b: City, routes: Collection<Route>, maxSearchRadius: Int): Boolean {
        return a.isProvinceCapital
                && b.isProvinceCapital
                && a.cityId != b.cityId
                && a.tile.distance(b.tile) <= maxSearchRadius
                && !routeAlreadyExists(a, b, routes)
    }

    private fun routeAlreadyExists(a: City, b: City, routes: Collection<Route>): Boolean {
        return routes.any {
            (it.cityIdA == a.cityId && it.cityIdB == b.cityId) || (it.cityIdA == b.cityId && it.cityIdB == a.cityId)
        }
    }

    private fun existingRoute(a: City, b: City, routes: List<Route>): Route? {
        return routes.find { (it.cityIdA == a.cityId && it.cityIdB == b.cityId) || (it.cityIdA == b.cityId && it.cityIdB == a.cityId) }
    }

    private fun findPath(
        pathfinder: Pathfinder<CityNetworkNode>,
        from: City,
        to: City,
        game: GameExtended
    ): Triple<City, City, Path<CityNetworkNode>> {
        return Triple(
            first = from,
            second = to,
            third = pathfinder.find(
                CityNetworkNode.of(game.tiles.get(from.tile)!!),
                CityNetworkNode.of(game.tiles.get(to.tile)!!),
            )
        )
    }

    private fun isValidPath(data: Triple<City, City, Path<CityNetworkNode>>): Boolean {
        return data.third.nodes.isNotEmpty()
    }

    private suspend fun createRoute(from: City, to: City, path: Path<CityNetworkNode>): Route {
        return Route(
            routeId = reservationInsert.reserveRoute(),
            cityIdA = from.cityId,
            cityIdB = to.cityId,
            path = path.nodes.map { TileRef(it.tile) }
        )
    }

}