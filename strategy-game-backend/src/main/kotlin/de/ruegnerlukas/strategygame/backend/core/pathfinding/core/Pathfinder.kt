package de.ruegnerlukas.strategygame.backend.core.pathfinding.core

import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.containers.TileContainer

class Pathfinder<T : Node>(
    private val nodeBuilder: NodeBuilder<T>,
    private val scoreCalculator: ScoreCalculator<T>,
    private val neighbourProvider: NeighbourProvider<T>
) {

    fun find(from: TilePosition, to: TilePosition, tiles: TileContainer): Path<T> {
        val startTile = tiles.get(from)
        val endTile = tiles.get(to)
        if (startTile == null || endTile == null) {
            return Path.empty()
        }
        return find(startTile, endTile, tiles)
    }


    fun find(tileStart: Tile, tileEnd: Tile, tiles: TileContainer): Path<T> {
        val context = PathfindingContext<T>(OpenList(), VisitedList())
        context.pushOpen(nodeBuilder.start(tileStart))
        return iterateOpen(context.open, tileEnd) { currentNode ->
            neighbourProvider.get(currentNode, tiles) { neighbourTile ->
                val score = calculateScore(currentNode, neighbourTile, tileEnd)
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


    private fun visitTile(context: PathfindingContext<T>, prev: T, current: Tile, score: NodeScore) {
        val existing = context.visited.get(current)
        if (existing == null || score.g < existing.g) {
            openTile(context, existing, prev, current, score)
        }
    }


    private fun openTile(context: PathfindingContext<T>, existing: T?, prev: T, current: Tile, score: NodeScore) {
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