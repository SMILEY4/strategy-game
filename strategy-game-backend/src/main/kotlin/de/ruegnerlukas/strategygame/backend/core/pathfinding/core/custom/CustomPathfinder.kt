package de.ruegnerlukas.strategygame.backend.core.pathfinding.core.custom

import de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced.AdvancedNeighbourProvider
import de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced.AdvancedNode
import de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced.AdvancedNodeBuilder
import de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced.AdvancedScoreCalculator
import de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced.rules.NextNodeRule
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.NodeScore
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.Path
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.Pathfinder
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.ports.models.containers.TileContainer


/**
 * Custom recursive backtracking pathfinder.
 * Compares to [de.ruegnerlukas.strategygame.backend.core.pathfinding.core.astar.AStarPathfinder]:
 * - maybe slower
 * - less limitations (support for e.g. max path cost, max provinces, ...)
 */
class CustomPathfinder(
    movementCosts: Map<TileType, Float>,
    rules: Collection<NextNodeRule>
) : Pathfinder<AdvancedNode> {

    private val neighbourProvider = AdvancedNeighbourProvider().withRules(rules)
    private val nodeBuilder = AdvancedNodeBuilder()
    private val scoreCalculator = AdvancedScoreCalculator(movementCosts)


    override fun find(from: TilePosition, to: TilePosition, tiles: TileContainer): Path<AdvancedNode> {
        val startTile = tiles.get(from)
        val endTile = tiles.get(to)
        if (startTile == null || endTile == null) {
            return Path.empty()
        }
        return find(startTile, endTile, tiles)
    }


    override fun find(tileStart: Tile, tileEnd: Tile, tiles: TileContainer): Path<AdvancedNode> {
        return find(Path(listOf(nodeBuilder.start(tileStart))), tileEnd, tiles) ?: Path.empty()
    }


    private fun find(path: Path<AdvancedNode>, target: Tile, tiles: TileContainer): Path<AdvancedNode>? {
        if (path.nodes.last().tile.tileId == target.tileId) {
            return path // found target -> return path
        }
        val nextTiles = findPossibleNextTiles(path, tiles)
        if (nextTiles.isEmpty()) {
            return null // dead end -> no path found
        }
        return nextTiles // recursively find possible paths
            .asSequence()
            .map { append(path, it, target) } // generate all paths with one more step
            .map { find(it, target, tiles) } // find paths continuing generated paths
            .filterNotNull() // discard all invalid paths / dead ends
            .sortedBy { it.nodes.last().g } // sort paths by cost
            .firstOrNull() // return best path
    }

    private fun append(path: Path<AdvancedNode>, tile: Tile, target: Tile): Path<AdvancedNode> {
        val score = calculateScore(path.nodes.last(), tile, target)
        val node = nodeBuilder.next(path.nodes.last(), tile, score)
        return Path(path.nodes + listOf(node))
    }

    private fun calculateScore(prev: AdvancedNode, next: Tile, destination: Tile): NodeScore {
        val g = scoreCalculator.g(prev, next)
        val h = scoreCalculator.h(next, destination)
        val f = scoreCalculator.f(g, h)
        return NodeScore(f, g, h)
    }

    private fun findPossibleNextTiles(path: Path<AdvancedNode>, tiles: TileContainer): List<Tile> {
        val pathTiles = path.nodes.map { it.tile.tileId }.toSet()
        val list = mutableListOf<Tile>()
        neighbourProvider.get(path.nodes.last(), tiles) { neighbour ->
            if (!pathTiles.contains(neighbour.tileId)) {
                list.add(neighbour)
            }
        }
        return list
    }

}