package io.github.smiley4.strategygame.backend.engine.module.core.common

import io.github.smiley4.strategygame.backend.common.models.GameConfig
import io.github.smiley4.strategygame.backend.common.utils.mapParallel
import io.github.smiley4.strategygame.backend.engine.ports.models.City
import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended
import io.github.smiley4.strategygame.backend.engine.ports.models.Route
import io.github.smiley4.strategygame.backend.common.models.TileRef
import io.github.smiley4.strategygame.backend.common.utils.distance
import io.github.smiley4.strategygame.backend.pathfinding.module.Path
import io.github.smiley4.strategygame.backend.pathfinding.module.Pathfinder


class RouteGenerator(
    private val gameConfig: GameConfig,
) {

    companion object {

        data class RequestCity(
            val cityId: String?,
            val isProvinceCapital: Boolean,
            val tile: TileRef
        ) {

            companion object {
                fun from(city: City) = RequestCity(
                    cityId = city.cityId,
                    isProvinceCapital = city.meta.isProvinceCapital,
                    tile = city.tile
                )
            }

        }

        data class GeneratedRoute(
            val existing: Route?,
            val cityIdA: String?,
            val cityIdB: String,
            val path: List<TileRef>
        )

    }

    suspend fun getNewOrUpdated(game: GameExtended, city: RequestCity): Sequence<GeneratedRoute> {
        val pathfinder = buildCityNetworkPathfinder(game, gameConfig)
        return game.cities
            .asSequence()
            .filter { canCreateRoute(city, it, game.routes, gameConfig.maxRouteLength) }
            .mapParallel { findPath(pathfinder, city, it, game) }
            .filter { isValidPath(it) }
            .mapNotNull { (from, to, path) -> createRoute(from, to, path, game) }
    }

    private fun canCreateRoute(a: RequestCity, b: City, routes: Collection<Route>, maxSearchRadius: Int): Boolean {
        return a.isProvinceCapital
                && b.meta.isProvinceCapital
                && a.cityId != b.cityId
                && a.tile.distance(b.tile) <= maxSearchRadius
                && !routeAlreadyExists(a, b, routes)
    }

    private fun findPath(
        pathfinder: Pathfinder<CityNetworkNode>,
        from: RequestCity,
        to: City,
        game: GameExtended
    ): Triple<RequestCity, City, Path<CityNetworkNode>> {
        return Triple(
            first = from,
            second = to,
            third = pathfinder.find(
                CityNetworkNode.of(game.tiles.get(from.tile)!!),
                CityNetworkNode.of(game.tiles.get(to.tile)!!),
            )
        )
    }

    private fun createRoute(from: RequestCity, to: City, path: Path<CityNetworkNode>, game: GameExtended): GeneratedRoute? {
        val existingRoute = existingRoute(from, to, game.routes)
        if (existingRoute == null) {
            return GeneratedRoute(
                existing = null,
                cityIdA = from.cityId,
                cityIdB = to.cityId,
                path = path.nodes.map { TileRef(it.tile) }
            )
        } else if (existingRoute.path.size > path.nodes.size) {
            return GeneratedRoute(
                existing = existingRoute,
                cityIdA = from.cityId,
                cityIdB = to.cityId,
                path = path.nodes.map { TileRef(it.tile) }
            )
        } else {
            return null
        }
    }

    private fun isValidPath(data: Triple<RequestCity, City, Path<CityNetworkNode>>): Boolean {
        return data.third.nodes.isNotEmpty()
    }

    private fun routeAlreadyExists(a: RequestCity, b: City, routes: Collection<Route>): Boolean {
        return routes.any {
            (it.cityIdA == a.cityId && it.cityIdB == b.cityId) || (it.cityIdA == b.cityId && it.cityIdB == a.cityId)
        }
    }

    private fun existingRoute(a: RequestCity, b: City, routes: List<Route>): Route? {
        return routes.find { (it.cityIdA == a.cityId && it.cityIdB == b.cityId) || (it.cityIdA == b.cityId && it.cityIdB == a.cityId) }
    }

}