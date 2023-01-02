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
import java.util.*


/**
 * Custom recursive backtracking pathfinder.
 * Compares to [de.ruegnerlukas.strategygame.backend.core.pathfinding.core.astar.AStarPathfinder]:
 * - slower
 * - less limitations (support for e.g. max path cost, max provinces, ...)
 */
class CustomPathfinder(
    movementCosts: Map<TileType, Float>,
    rules: Collection<NextNodeRule>
) : Pathfinder<AdvancedNode> {

    companion object {

        private data class ExtPath(
            val nodes: List<AdvancedNode>,
            val tileIds: Set<String>,
            val f: Float,
        ) {

            companion object {
                fun of(nodes: List<AdvancedNode>): ExtPath {
                    return ExtPath(
                        nodes,
                        nodes.asSequence().map { it.tile.tileId }.toSet(),
                        nodes.last().f
                    )
                }

                fun of(path: ExtPath, node: AdvancedNode): ExtPath {
                    return ExtPath(
                        path.nodes + node,
                        path.tileIds + node.tile.tileId,
                        node.f
                    )
                }
            }
        }
    }

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
        return Path(findPath(tileStart, tileEnd, tiles).nodes)
    }


    private fun findPath(tileStart: Tile, tileEnd: Tile, tiles: TileContainer): ExtPath {
        val openPaths = PriorityQueue<ExtPath>(Comparator.comparing { it.f })
        openPaths.offer(ExtPath.of(listOf(nodeBuilder.start(tileStart))))
        while (openPaths.isNotEmpty()) {
            val current = openPaths.poll()
            if (current.nodes.last().tile.tileId == tileEnd.tileId) {
                return current
            }
            findPossibleNextTiles(current, tiles) {
                openPaths.add(append(current, it, tileEnd))
            }
        }
        return ExtPath.of(listOf())
    }


    private fun findPossibleNextTiles(path: ExtPath, tiles: TileContainer, consumer: (tile: Tile) -> Unit) {
        neighbourProvider.get(path.nodes.last(), tiles) { neighbour ->
            if (!path.tileIds.contains(neighbour.tileId)) {
                consumer(neighbour)
            }
        }
    }

    private fun append(path: ExtPath, tile: Tile, target: Tile): ExtPath {
        val score = calculateScore(path.nodes.last(), tile, target)
        val node = nodeBuilder.next(path.nodes.last(), tile, score)
        return ExtPath.of(path, node)
    }

    private fun calculateScore(prev: AdvancedNode, next: Tile, destination: Tile): NodeScore {
        val g = scoreCalculator.g(prev, next)
        val h = scoreCalculator.h(next, destination)
        val f = scoreCalculator.f(g, h)
        return NodeScore(f, g, h)
    }

}