package io.github.smiley4.strategygame.backend.engine.application.core.tools

import io.github.smiley4.strategygame.backend.common.utils.containedIn
import io.github.smiley4.strategygame.backend.common.utils.distance
import io.github.smiley4.strategygame.backend.common.utils.notContainedIn
import io.github.smiley4.strategygame.backend.common.utils.positionsNeighbours
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.TerrainType
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.TileContainer
import io.github.smiley4.strategygame.backend.commondata.TilePosition
import io.github.smiley4.strategygame.backend.commondata.position
import io.github.smiley4.strategygame.backend.pathfinding.Node
import io.github.smiley4.strategygame.backend.pathfinding.Pathfinder
import io.github.smiley4.strategygame.backend.pathfinding.neighbours.ConditionalNeighbourProvider
import io.github.smiley4.strategygame.backend.pathfinding.neighbours.NeighbourCondition
import io.github.smiley4.strategygame.backend.pathfinding.score.ScoreCalculator

object RouteNetworkPathfinder {

    const val MAX_PATH_LENGTH = 10;

    internal fun build(game: GameExtended): Pathfinder<RouteNetworkNode> {
        return Pathfinder.createBacktracking(
            RouteNetworkNeighbourProvider(game.tiles).withConditions(
                RouteNetworkCondition.MaxPathLength(MAX_PATH_LENGTH),
                RouteNetworkCondition.BlockingTiles(setOf(TerrainType.MOUNTAIN)),
                RouteNetworkCondition.SwitchLandWater(game.settlements.map { it.tile.position() })
            ), RouteNetworkScoreCalculator()
        )
    }

    class RouteNetworkNode(
        val tile: Tile,
        val pathLength: Int,
        prevNode: Node?
    ) : Node(locationId = tile.id.value, prevNode = prevNode) {

        companion object {
            fun create(tile: Tile) = RouteNetworkNode(tile, 0, null)
        }


    }


    private class RouteNetworkScoreCalculator : ScoreCalculator<RouteNetworkNode> {

        override fun f(g: Float, h: Float): Float {
            return g + h
        }

        override fun h(node: RouteNetworkNode, destination: RouteNetworkNode): Float {
            return node.tile.position.distance(destination.tile.position).toFloat()
        }

        override fun g(prev: RouteNetworkNode, next: RouteNetworkNode): Float {
            return prev.g + movementCost(prev.tile) / 2f + movementCost(next.tile) / 2f
        }

        private fun movementCost(tile: Tile) = 1f // note: terrain type dependent movement cost not yet implemented

    }


    private class RouteNetworkNeighbourProvider(val tiles: TileContainer) : ConditionalNeighbourProvider<RouteNetworkNode>() {

        override fun getNeighbourCandidates(current: RouteNetworkNode, consumer: (neighbour: RouteNetworkNode) -> Unit) {
            positionsNeighbours(current.tile.position) { q, r ->
                tiles.get(q, r)?.also {
                    consumer(
                        RouteNetworkNode(
                            tile = it,
                            prevNode = current,
                            pathLength = current.pathLength + 1,
                        )
                    )
                }
            }
        }

    }


    private object RouteNetworkCondition {

        class MaxPathLength(private val maxLength: Int) : NeighbourCondition<RouteNetworkNode> {
            override fun evaluate(prev: RouteNetworkNode, next: RouteNetworkNode): Boolean {
                return (prev.pathLength + 1) <= maxLength
            }
        }

        class BlockingTiles(private val blockingTiles: Set<TerrainType>) : NeighbourCondition<RouteNetworkNode> {
            override fun evaluate(prev: RouteNetworkNode, next: RouteNetworkNode): Boolean {
                return next.tile.dataWorld.terrainType.notContainedIn(blockingTiles)
            }
        }

        class SwitchLandWater(private val switchingPoints: Collection<TilePosition>) : NeighbourCondition<RouteNetworkNode> {
            override fun evaluate(prev: RouteNetworkNode, next: RouteNetworkNode): Boolean {
                if (isLand(prev.tile) && isWater(next.tile)) {
                    return isSwitchingPoint(prev.tile)
                }
                if (isWater(prev.tile) && isLand(next.tile)) {
                    return isSwitchingPoint(next.tile)
                }
                return true
            }

            private fun isWater(tile: Tile) = tile.dataWorld.terrainType == TerrainType.WATER
            private fun isLand(tile: Tile) = !isWater(tile)
            private fun isSwitchingPoint(tile: Tile) = tile.position.containedIn(switchingPoints)
        }

    }
}


