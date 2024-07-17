package io.github.smiley4.strategygame.backend.engine.moduleold.common

import io.github.smiley4.strategygame.backend.common.utils.positionsNeighbours
import io.github.smiley4.strategygame.backend.common.utils.distance
import io.github.smiley4.strategygame.backend.commondata.GameConfig
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.TerrainType
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.TileContainer
import io.github.smiley4.strategygame.backend.commondata.TilePosition
import io.github.smiley4.strategygame.backend.pathfinding.edge.ConditionalNeighbourProvider
import io.github.smiley4.strategygame.backend.pathfinding.edge.NeighbourCondition
import io.github.smiley4.strategygame.backend.pathfinding.edge.Node
import io.github.smiley4.strategygame.backend.pathfinding.edge.Pathfinder
import io.github.smiley4.strategygame.backend.pathfinding.edge.ScoreCalculator


internal fun buildCityNetworkPathfinder(game: GameExtended, config: GameConfig): Pathfinder<CityNetworkNode> {
    return Pathfinder.createBacktracking(
        CityNetworkNeighbourProvider(game.tiles).withConditions(
            CityNetworkNeighbourCondition.BlockingTiles(setOf(TerrainType.MOUNTAIN)),
            CityNetworkNeighbourCondition.MaxPathLength(config.maxRouteLength),
            CityNetworkNeighbourCondition.MaxProvinces(2),
            CityNetworkNeighbourCondition.SwitchFromToWaterViaPoints(game.cities.map { TilePosition(it.tile.q, it.tile.r) })
        ),
        CityNetworkScoreCalculator(emptyMap())
    )
}

class CityNetworkNode(
    val tile: Tile,
    val pathLength: Int,
    val visitedProvinces: Set<String>,
    prevNode: Node?,
) : Node(
    locationId = "${tile.position.q},${tile.position.r}",
    prevNode = prevNode,
    f = 0f,
    g = 0f,
    h = 0f
) {
    companion object {
        fun of(tile: Tile): CityNetworkNode {
            return CityNetworkNode(
                tile = tile,
                pathLength = 1,
                visitedProvinces = tile.owner?.provinceId?.let { setOf(it) } ?: setOf(),
                prevNode = null
            )
        }
    }
}


class CityNetworkScoreCalculator(private val movementCosts: Map<TerrainType, Float>) : ScoreCalculator<CityNetworkNode> {

    override fun f(g: Float, h: Float): Float {
        return g + h
    }

    override fun h(node: CityNetworkNode, destination: CityNetworkNode): Float {
        return node.tile.position.distance(destination.tile.position).toFloat()
    }

    override fun g(prev: CityNetworkNode, next: CityNetworkNode): Float {
        return prev.g + movementCost(prev.tile) / 2f + movementCost(next.tile) / 2f
    }

    private fun movementCost(tile: Tile): Float {
        return movementCosts[tile.data.terrainType] ?: 1f
    }

}


class CityNetworkNeighbourProvider(private val tiles: TileContainer) : ConditionalNeighbourProvider<CityNetworkNode>() {

    override fun getNeighbourCandidates(current: CityNetworkNode, consumer: (neighbour: CityNetworkNode) -> Unit) {
        positionsNeighbours(current.tile.position) { q, r ->
            val neighbourTile = tiles.get(q, r)
            if (neighbourTile != null) {
                val neighbourNode = CityNetworkNode(neighbourTile,
                    pathLength = current.pathLength + 1,
                    visitedProvinces = current.visitedProvinces + (neighbourTile.owner?.provinceId?.let { setOf(it) } ?: setOf()),
                    prevNode = current
                )
                consumer(neighbourNode)
            }
        }
    }

}


object CityNetworkNeighbourCondition {

    /**
     * The path can not cross more than the given max amount of different provinces (Unclaimed tiles are not counted)
     */
    class MaxProvinces(private val maxProvinces: Int) : NeighbourCondition<CityNetworkNode> {

        override fun evaluate(prev: CityNetworkNode, next: CityNetworkNode): Boolean {
            val enterNewProvince = next.tile.owner?.provinceId
                ?.let { !prev.visitedProvinces.contains(it) }
                ?: false
            return if (enterNewProvince) {
                prev.visitedProvinces.size + 1 <= maxProvinces
            } else {
                true
            }
        }

    }


    /**
     * The total amount of nodes in the path may not be greater than the given max-value
     */
    class MaxPathLength(private val maxLength: Int) : NeighbourCondition<CityNetworkNode> {

        override fun evaluate(prev: CityNetworkNode, next: CityNetworkNode): Boolean {
            return (prev.pathLength + 1) <= maxLength
        }

    }


    /**
     * The total cost of the path can not be greater than the given max-cost
     */
    class MaxPathCost(
        private val maxCost: Float,
        private val scoreCalculator: ScoreCalculator<CityNetworkNode>
    ) : NeighbourCondition<CityNetworkNode> {

        override fun evaluate(prev: CityNetworkNode, next: CityNetworkNode): Boolean {
            return prev.g + scoreCalculator.g(prev, next) <= maxCost
        }

    }


    /**
     * The path may not go through any of the given tile-types
     */
    class BlockingTiles(private val blockingTiles: Set<TerrainType>) : NeighbourCondition<CityNetworkNode> {

        override fun evaluate(prev: CityNetworkNode, next: CityNetworkNode): Boolean {
            return !blockingTiles.contains(next.tile.data.terrainType)
        }

    }


    /**
     * The path may only switch from water to land (or from land to water) at specified points
     */
    class SwitchFromToWaterViaPoints(private val switchingPoints: Collection<TilePosition>) : NeighbourCondition<CityNetworkNode> {

        override fun evaluate(prev: CityNetworkNode, next: CityNetworkNode): Boolean {
            if (isLand(prev.tile) && isWater(next.tile)) {
                return isSwitchingPoint(prev.tile)
            }
            if (isWater(prev.tile) && isLand(next.tile)) {
                return isSwitchingPoint(next.tile)
            }
            return true
        }

        private fun isWater(tile: Tile): Boolean {
            return tile.data.terrainType == TerrainType.WATER
        }

        private fun isLand(tile: Tile): Boolean {
            return tile.data.terrainType != TerrainType.WATER
        }

        private fun isSwitchingPoint(tile: Tile): Boolean {
            return switchingPoints.contains(tile.position)
        }

    }


}