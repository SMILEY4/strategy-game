package io.github.smiley4.strategygame.backend.engine.application.core.process.steps

import io.github.smiley4.strategygame.backend.common.utils.distance
import io.github.smiley4.strategygame.backend.common.utils.gen
import io.github.smiley4.strategygame.backend.common.utils.mapParallel
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Route
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.ref
import io.github.smiley4.strategygame.backend.engine.application.core.process.events.CreatedSettlementEvent
import io.github.smiley4.strategygame.backend.engine.application.core.process.system.ProcessStep
import io.github.smiley4.strategygame.backend.engine.application.core.tools.RouteNetworkPathfinder
import io.github.smiley4.strategygame.backend.pathfinding.Path
import io.github.smiley4.strategygame.backend.pathfinding.Pathfinder

class UpdateRoutesStep : ProcessStep<CreatedSettlementEvent> {

    override suspend fun run(event: CreatedSettlementEvent) {
        calculateAllRoutes(event.game, event.settlement).forEach { route ->
            event.game.routes.removeIf { it.isEqualIgnoreDirection(route) }
            event.game.routes.add(route)
        }
    }

    private suspend fun calculateAllRoutes(game: GameExtended, origin: Settlement): Sequence<Route> {
        val pathfinder = RouteNetworkPathfinder.build(game)
        return game.settlements
            .asSequence()
            .filter { isPotentialRoute(game, origin, it) }
            .mapParallel { findPath(pathfinder, game, origin, it) }
            .filter { (origin, destination, path) -> isValidPath(origin, destination, path, game.routes) }
            .map { (origin, destination, path) -> createRoute(origin, destination, path) }
    }

    private fun isPotentialRoute(game: GameExtended, origin: Settlement, destination: Settlement): Boolean {
        return origin != destination
                && origin.tile.distance(destination.tile) <= RouteNetworkPathfinder.MAX_PATH_LENGTH
                && discoveredEachOther(game, origin, destination)
    }

    private fun findPath(
        pathfinder: Pathfinder<RouteNetworkPathfinder.RouteNetworkNode>,
        game: GameExtended,
        origin: Settlement,
        destination: Settlement
    ): Triple<Settlement, Settlement, Path<RouteNetworkPathfinder.RouteNetworkNode>> {
        return Triple(
            first = origin,
            second = destination,
            third = pathfinder.find(
                RouteNetworkPathfinder.RouteNetworkNode.create(game.tiles.get(origin.tile)!!),
                RouteNetworkPathfinder.RouteNetworkNode.create(game.tiles.get(destination.tile)!!)
            )
        )
    }

    private fun isValidPath(
        origin: Settlement,
        destination: Settlement,
        path: Path<RouteNetworkPathfinder.RouteNetworkNode>,
        existingRoutes: Collection<Route>
    ): Boolean {
        return path.nodes.isNotEmpty() && existingRoutes.none { it.isEqualIgnoreDirection(origin.id, destination.id) }
    }

    private fun createRoute(origin: Settlement, destination: Settlement, path: Path<RouteNetworkPathfinder.RouteNetworkNode>): Route {
        return Route(
            id = Route.Id.gen(),
            settlementA = origin.id,
            settlementB = destination.id,
            path = path.nodes.map { it.tile.ref() }
        )
    }

    private fun Route.isEqualIgnoreDirection(other: Route): Boolean {
        return (this.settlementA == other.settlementA && this.settlementB == other.settlementB) || this.settlementA == other.settlementB && this.settlementB == other.settlementA
    }

    private fun Route.isEqualIgnoreDirection(settlementA: Settlement.Id, settlementB: Settlement.Id): Boolean {
        return (this.settlementA == settlementA && this.settlementB == settlementB) || this.settlementA == settlementB && this.settlementB == settlementA
    }

    private fun discoveredEachOther(game: GameExtended, settlementA: Settlement, settlementB: Settlement): Boolean {
        val aDiscoveredB = game.findTile(settlementA.tile).dataPolitical.discoveredByCountries.contains(settlementA.country)
        val bDiscoveredA = game.findTile(settlementB.tile).dataPolitical.discoveredByCountries.contains(settlementB.country)
        return aDiscoveredB && bDiscoveredA
    }

}