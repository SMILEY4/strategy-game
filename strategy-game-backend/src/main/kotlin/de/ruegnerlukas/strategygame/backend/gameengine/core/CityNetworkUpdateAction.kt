package de.ruegnerlukas.strategygame.backend.gameengine.core

import de.ruegnerlukas.strategygame.backend.common.models.GameExtended

/**
 * Connects newly created cities with other cities
 */
class CityNetworkUpdateAction(private val gameConfig: GameConfig, private val reservationInsert: ReservationInsert) : Logging {

    suspend fun perform(game: GameExtended, creationResult: CityCreationAction.Companion.CityCreationResult) {
        log().debug("Update city network after creation of city ${creationResult.city.cityId}")
        if (creationResult.city.isProvinceCapital) {
            createOrUpdateRoutes(creationResult.city, game)
        } else {
            val province = creationResult.province
            val capitalCity = game.cities.find { it.cityId == province.provinceCapitalCityId } ?: throw Exception("City not found")
            createOrUpdateRoutes(capitalCity, game)
        }
    }

    private suspend fun createOrUpdateRoutes(city: City, game: GameExtended) {
        val pathfinder = buildPathfinder(game)
        game.cities
            .asSequence()
            .filter { canCreateRoute(city, it, game.routes, gameConfig.maxRouteLength) }
            .mapParallel { findPath(pathfinder, city, it, game) }
            .filter { isValidPath(it) }
            .forEach { (from, to, path) -> createOrUpdateRoute(from, to, path, game) }
    }

    private suspend fun createOrUpdateRoute(from: City, to: City, path: Path<ExtendedNode>, game: GameExtended) {
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

    private fun buildPathfinder(game: GameExtended): Pathfinder<ExtendedNode> {
        return BacktrackingPathfinder(
            ExtendedNodeBuilder(),
            ExtendedScoreCalculator(mapOf()),
            ExtendedNeighbourProvider().withRules(
                listOf(
                    BlockingTilesRule(setOf(TileType.MOUNTAIN)),
                    MaxPathLengthRule(gameConfig.maxRouteLength),
                    MaxProvincesRule(2),
                    SwitchFromToWaterViaPointsRule(game.cities.map { TilePosition(it.tile) })
                )
            )
        )
    }

    private fun canCreateRoute(a: City, b: City, routes: List<Route>, maxSearchRadius: Int): Boolean {
        return a.isProvinceCapital
                && b.isProvinceCapital
                && a.cityId != b.cityId
                && a.tile.distance(b.tile) <= maxSearchRadius
//                && !routeAlreadyExists(a, b, routes)
    }

    private fun routeAlreadyExists(a: City, b: City, routes: List<Route>): Boolean {
        return routes.any {
            (it.cityIdA == a.cityId && it.cityIdB == b.cityId) || (it.cityIdA == b.cityId && it.cityIdB == a.cityId)
        }
    }

    private fun existingRoute(a: City, b: City, routes: List<Route>): Route? {
        return routes.find { (it.cityIdA == a.cityId && it.cityIdB == b.cityId) || (it.cityIdA == b.cityId && it.cityIdB == a.cityId) }
    }

    private fun findPath(pf: Pathfinder<ExtendedNode>, from: City, to: City, game: GameExtended): Triple<City, City, Path<ExtendedNode>> {
        return Triple(
            first = from,
            second = to,
            third = pf.find(
                start = TilePosition(from.tile),
                destination = TilePosition(to.tile),
                tiles = game.tiles
            )
        )
    }

    private fun isValidPath(data: Triple<City, City, Path<ExtendedNode>>): Boolean {
        return data.third.nodes.isNotEmpty()
    }

    private suspend fun createRoute(from: City, to: City, path: Path<ExtendedNode>): Route {
        return Route(
            routeId = reservationInsert.reserveRoute(),
            cityIdA = from.cityId,
            cityIdB = to.cityId,
            path = path.nodes.map { TileRef(it.tile) }
        )
    }

}