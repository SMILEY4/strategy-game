package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventCityCreate
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventTileInfluenceUpdate
import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.core.pathfinding.Path
import de.ruegnerlukas.strategygame.backend.core.pathfinding.Pathfinder
import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.ExtendedNeighbourProvider
import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.ExtendedNode
import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.ExtendedNodeBuilder
import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.ExtendedScoreCalculator
import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.rules.BlockingTilesRule
import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.rules.MaxPathLengthRule
import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.rules.MaxProvincesRule
import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.rules.SwitchFromToWaterViaPointsRule
import de.ruegnerlukas.strategygame.backend.core.pathfinding.backtracking.BacktrackingPathfinder
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Route
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.ReservationInsert
import de.ruegnerlukas.strategygame.backend.shared.distance
import de.ruegnerlukas.strategygame.backend.shared.mapParallel

/**
 * Connects newly created cities with other cities
 * - triggered by [GameEventCityCreate]
 * - triggers nothing
 */
class GameActionCityNetworkUpdate(
    private val gameConfig: GameConfig,
    private val reservationInsert: ReservationInsert
) : GameAction<GameEventCityCreate>(GameEventCityCreate.TYPE) {

    override suspend fun perform(event: GameEventCityCreate): List<GameEvent> {
        if (!event.city.isProvinceCapital) {
            return emptyList()
        }
        val pathfinder = buildPathfinder(event.game)
        event.game.cities
            .asSequence()
            .filter { canCreateRoute(event.city, it, gameConfig.maxRouteLength) }
            .mapParallel { findPath(pathfinder, event.city, it, event.game) }
            .filter { isValidPath(it) }
            .forEach { (from, to, path) -> event.game.routes.add(createRoute(from, to, path)) }
        return emptyList()
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

    private fun canCreateRoute(from: City, to: City, maxSearchRadius: Int): Boolean {
        return from.isProvinceCapital
                && to.isProvinceCapital
                && from.cityId != to.cityId
                && from.tile.distance(to.tile) <= maxSearchRadius
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
            routeId = reservationInsert.reserveCity(),
            cityIdA = from.cityId,
            cityIdB = to.cityId,
            path = path.nodes.map { TileRef(it.tile) }
        )
    }

}