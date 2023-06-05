package de.ruegnerlukas.strategygame.backend.pathfinding.astar

import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.models.TilePosition
import de.ruegnerlukas.strategygame.backend.common.models.containers.TileContainer
import de.ruegnerlukas.strategygame.backend.pathfinding.NeighbourProvider
import de.ruegnerlukas.strategygame.backend.pathfinding.Node
import de.ruegnerlukas.strategygame.backend.pathfinding.NodeBuilder
import de.ruegnerlukas.strategygame.backend.pathfinding.NodeScore
import de.ruegnerlukas.strategygame.backend.pathfinding.Path
import de.ruegnerlukas.strategygame.backend.pathfinding.Pathfinder
import de.ruegnerlukas.strategygame.backend.pathfinding.ScoreCalculator

/**
 * Basic A*-Pathfinder.
 * Compares to [de.ruegnerlukas.strategygame.backend.core.pathfinding.core.backtracking.BacktrackingPathfinder]:
 * - faster
 * - more limitations (no support for e.g. max path cost, max provinces, ...)
 */
class AStarPathfinder<T : Node>(
    private val nodeBuilder: NodeBuilder<T>,
    private val scoreCalculator: ScoreCalculator<T>,
    private val neighbourProvider: NeighbourProvider<T>
) : Pathfinder<T> {

    override fun find(start: TilePosition, destination: TilePosition, tiles: TileContainer): Path<T> {
        val startTile = tiles.get(start)
        val endTile = tiles.get(destination)
        if (startTile == null || endTile == null) {
            return Path.empty()
        }
        return find(startTile, endTile, tiles)
    }


    override fun find(tileStart: Tile, tileDestination: Tile, tiles: TileContainer): Path<T> {
        val context = AStarPathfindingContext<T>(OpenList(), VisitedList())
        context.pushOpen(nodeBuilder.start(tileStart))
        return iterateOpen(context.open, tileDestination) { currentNode ->
            neighbourProvider.get(currentNode, tiles) { neighbourTile ->
                val score = calculateScore(currentNode, neighbourTile, tileDestination)
                visitTile(context, currentNode, neighbourTile, score)
            }
        }
    }


    private fun iterateOpen(open: OpenList<T>, destination: Tile, consumer: (node: T) -> Unit): Path<T> {
        while (open.isNotEmpty()) {
            val currentNode = open.next()
            if (currentNode.tile.tileId == destination.tileId) {
                return reconstructPath(currentNode)
            } else {
                consumer(currentNode)
            }
        }
        return Path.empty()
    }


    private fun calculateScore(prev: T, next: Tile, destination: Tile): NodeScore {
        val g = scoreCalculator.g(prev, next)
        val h = scoreCalculator.h(next, destination)
        val f = scoreCalculator.f(g, h)
        return NodeScore(f, g, h)
    }


    private fun visitTile(context: AStarPathfindingContext<T>, prev: T, current: Tile, score: NodeScore) {
        val existing = context.visited.get(current)
        if (existing == null || score.g < existing.g) {
            openTile(context, existing, prev, current, score)
        }
    }


    private fun openTile(context: AStarPathfindingContext<T>, existing: T?, prev: T, current: Tile, score: NodeScore) {
        context.pushOpen(nodeBuilder.next(prev, current, score), existing)
    }


    private fun reconstructPath(node: T): Path<T> {
        val nodes = mutableListOf<T>()
        var current: T? = node
        while (current != null) {
            nodes.add(current)
            @Suppress("UNCHECKED_CAST")
            current = current.prevNode?.let { it as T }
        }
        return Path(nodes.reversed())
    }

}