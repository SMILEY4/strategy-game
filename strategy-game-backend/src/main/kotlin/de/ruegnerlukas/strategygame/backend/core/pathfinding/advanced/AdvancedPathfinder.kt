package de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced

import de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced.rules.NextNodeRule
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.Path
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.astar.AStarPathfinder
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.ports.models.containers.TileContainer

    /*
    - max path length (amount nodes)
    - max path length (movement cost)
    - max crossing provinces
    - ...
     */
class AdvancedPathfinder(movementCosts: Map<TileType, Float>, rules: Collection<NextNodeRule>) {

    private val pathfinder = AStarPathfinder(
        AdvancedNodeBuilder(),
        AdvancedScoreCalculator(movementCosts),
        AdvancedNeighbourProvider().withRules(rules)
    )

    fun find(from: TilePosition, to: TilePosition, tiles: TileContainer): Path<AdvancedNode> {
        return pathfinder.find(from, to, tiles)
    }

    fun find(tileStart: Tile, tileEnd: Tile, tiles: TileContainer): Path<AdvancedNode> {
        return pathfinder.find(tileStart, tileEnd, tiles)
    }

}