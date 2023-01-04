package de.ruegnerlukas.strategygame.backend.core.pathfinding.backtracking

import de.ruegnerlukas.strategygame.backend.core.pathfinding.*
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.containers.TileContainer
import java.util.*


/**
 * Custom recursive backtracking pathfinder.
 * Compares to [de.ruegnerlukas.strategygame.backend.core.pathfinding.core.astar.AStarPathfinder]:
 * - slower
 * - less limitations (support for e.g. max path cost, max provinces, ...)
 */
class BacktrackingPathfinder<T : Node>(
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
        return Path(findPath(tileStart, tileDestination, tiles).nodes)
    }


    private fun findPath(tileStart: Tile, tileEnd: Tile, tiles: TileContainer): BacktrackingPath<T> {
        val openPaths = initOpenPaths(tileStart)
        return iterateOpen(openPaths, tileEnd) { current ->
            findPossibleNextTiles(current, tiles) {
                openPaths.add(append(current, it, tileEnd))
            }
        }
    }


    private fun initOpenPaths(tileStart: Tile): PriorityQueue<BacktrackingPath<T>> {
        return PriorityQueue<BacktrackingPath<T>>(Comparator.comparing { it.f }).also {
            it.offer(BacktrackingPath.of(listOf(nodeBuilder.start(tileStart))))
        }
    }


    private fun iterateOpen(
        openPaths: PriorityQueue<BacktrackingPath<T>>,
        tileEnd: Tile,
        consumer: (path: BacktrackingPath<T>) -> Unit
    ): BacktrackingPath<T> {
        while (openPaths.isNotEmpty()) {
            val current = openPaths.poll()
            if (current.nodes.last().tile.tileId == tileEnd.tileId) {
                return current
            }
            consumer(current)
        }
        return BacktrackingPath.of(listOf())
    }


    private fun findPossibleNextTiles(path: BacktrackingPath<T>, tiles: TileContainer, consumer: (tile: Tile) -> Unit) {
        neighbourProvider.get(path.nodes.last(), tiles) { neighbour ->
            if (!path.tileIds.contains(neighbour.tileId)) {
                consumer(neighbour)
            }
        }
    }


    private fun append(path: BacktrackingPath<T>, tile: Tile, target: Tile): BacktrackingPath<T> {
        val score = calculateScore(path.nodes.last(), tile, target)
        val node = nodeBuilder.next(path.nodes.last(), tile, score)
        return BacktrackingPath.of(path, node)
    }


    private fun calculateScore(prev: T, next: Tile, destination: Tile): NodeScore {
        val g = scoreCalculator.g(prev, next)
        val h = scoreCalculator.h(next, destination)
        val f = scoreCalculator.f(g, h)
        return NodeScore(f, g, h)
    }

}