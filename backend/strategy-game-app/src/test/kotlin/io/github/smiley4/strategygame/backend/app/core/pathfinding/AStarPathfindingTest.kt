package io.github.smiley4.strategygame.backend.app.core.pathfinding

import io.github.smiley4.strategygame.backend.app.core.pathfinding.utils.TestNode
import io.github.smiley4.strategygame.backend.app.core.pathfinding.utils.node
import io.github.smiley4.strategygame.backend.common.models.Tile
import io.github.smiley4.strategygame.backend.common.models.TileData
import io.github.smiley4.strategygame.backend.common.models.TilePosition
import io.github.smiley4.strategygame.backend.common.models.terrain.TerrainResourceType
import io.github.smiley4.strategygame.backend.common.models.terrain.TerrainType
import io.github.smiley4.strategygame.backend.common.utils.distance
import io.github.smiley4.strategygame.backend.common.utils.positionsNeighbours
import io.github.smiley4.strategygame.backend.engine.ports.models.TileContainer
import io.github.smiley4.strategygame.backend.pathfinding.NeighbourProvider
import io.github.smiley4.strategygame.backend.pathfinding.ScoreCalculator
import io.github.smiley4.strategygame.backend.pathfinding.algorithms.astar.AStarPathfinder
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.floats.shouldBeWithinPercentageOf

class AStarPathfindingTest : StringSpec({

    "basic path with blocking terrain" {
        val tiles = buildTiles(
            listOf(
                listOf(0, 0, 0),
                listOf(1, 1, 0),
                listOf(0, 0, 1),
                listOf(0, 0, 0),
            )
        )
        val pathfinder = AStarPathfinder(
            TerrainBasedNeighbourProvider(tiles),
            BasicScoreCalculator(),
        )
        val path = pathfinder.find(
            tiles.get(0, 0).node(),
            tiles.get(2, 3).node(),
        )
        path.nodes.map { it.tile.position } shouldContainExactly listOf(
            TilePosition(0, 0),
            TilePosition(1, 0),
            TilePosition(2, 0),
            TilePosition(2, 1),
            TilePosition(1, 2),
            TilePosition(1, 3),
            TilePosition(2, 3),
        )
        path.nodes.last().g.shouldBeWithinPercentageOf(6.0f, 0.1)
    }

    "no path possible" {
        val tiles = buildTiles(
            listOf(
                listOf(0, 0),
                listOf(1, 1),
                listOf(0, 0),
            )
        )
        val pathfinder = AStarPathfinder(
            TerrainBasedNeighbourProvider(tiles),
            BasicScoreCalculator(),
        )
        val path = pathfinder.find(
           tiles.get(0, 0).node(),
           tiles.get(1, 2).node(),
        )
        path.nodes.map { it.tile.position }.shouldBeEmpty()

    }

    "start is same as end" {
        val tiles = buildTiles(
            listOf(
                listOf(0, 0),
                listOf(0, 0),
            )
        )
        val pathfinder = AStarPathfinder(
            TerrainBasedNeighbourProvider(tiles),
            BasicScoreCalculator(),
        )
        val path = pathfinder.find(
            tiles.get(0, 0).node(),
            tiles.get(0, 0).node(),
        )
        path.nodes.map { it.tile.position } shouldContainExactly listOf(
            TilePosition(0, 0)
        )
        path.nodes.last().g.shouldBeWithinPercentageOf(0.0f, 0.1)
    }

    "start is neighbour of end" {
        val tiles = buildTiles(
            listOf(
                listOf(0, 0),
                listOf(0, 0),
            )
        )
        val pathfinder = AStarPathfinder(
            TerrainBasedNeighbourProvider(tiles),
            BasicScoreCalculator(),
        )
        val path = pathfinder.find(
            tiles.get(0, 0).node(),
            tiles.get(1, 0).node(),
        )
        path.nodes.map { it.tile.position } shouldContainExactly listOf(
            TilePosition(0, 0),
            TilePosition(1, 0)
        )
        path.nodes.last().g.shouldBeWithinPercentageOf(1.0f, 0.1)
    }


    "path with different movement cost options" {
        val tiles = buildTiles(
            listOf(
                listOf(0, 0, 0),
                listOf(2, 1, 0),
                listOf(2, 1, 2),
                listOf(0, 0, 0),
            )
        )
        val pathfinder = AStarPathfinder(
            TerrainBasedNeighbourProvider(tiles),
            TerrainBasedScoreCalculator(),
        )
        val path = pathfinder.find(
            tiles.get(1, 0).node(),
            tiles.get(1, 3).node(),
        )
        path.nodes.map { it.tile.position } shouldContainExactly listOf(
            TilePosition(1, 0),
            TilePosition(2, 0),
            TilePosition(2, 1),
            TilePosition(2, 2),
            TilePosition(1, 3),
        )
        path.nodes.last().g.shouldBeWithinPercentageOf(5.0f, 0.1)
    }

}) {

    private companion object {

        class TerrainBasedNeighbourProvider(private val tiles: TileContainer) : NeighbourProvider<TestNode> {
            override fun getNeighbours(current: TestNode, consumer: (neighbour: TestNode) -> Unit) {
                positionsNeighbours(current.tile.position) { q, r ->
                    val neighbour = tiles.get(q, r)
                    if (neighbour != null && neighbour.data.terrainType != TerrainType.WATER) {
                        consumer(
                            TestNode(
                                tile = neighbour,
                                pathLength = current.pathLength + 1,
                                visitedProvinces = emptySet(),
                                prevNode = current
                            )
                        )
                    }
                }
            }
        }

        class BasicScoreCalculator : ScoreCalculator<TestNode> {

            override fun f(g: Float, h: Float): Float {
                return g + h
            }

            override fun h(node: TestNode, destination: TestNode): Float {
                return node.tile.position.distance(destination.tile.position).toFloat()
            }

            override fun g(prev: TestNode, next: TestNode): Float {
                return prev.g + 1f
            }
        }

        class TerrainBasedScoreCalculator : ScoreCalculator<TestNode> {

            override fun f(g: Float, h: Float): Float {
                return g + h
            }

            override fun h(node: TestNode, destination: TestNode): Float {
                return node.tile.position.distance(destination.tile.position).toFloat()
            }

            override fun g(prev: TestNode, next: TestNode): Float {
                return prev.g + ((movementCost(prev.tile) + movementCost(next.tile)) / 2f)
            }

            private fun movementCost(tile: Tile): Float {
                return when (tile.data.terrainType) {
                    TerrainType.LAND -> 1f
                    TerrainType.WATER -> 99999f
                    TerrainType.MOUNTAIN -> 2f
                }
            }
        }

        fun buildTiles(ids: List<List<Int>>): TileContainer {
            val tiles = mutableListOf<Tile>()
            ids.forEachIndexed { r, qIds ->
                qIds.forEachIndexed { q, id ->
                    tiles.add(
                        Tile(
                            tileId = "$q/$r",
                            position = TilePosition(q, r),
                            data = TileData(
                                terrainType = when (id) {
                                    1 -> TerrainType.WATER
                                    2 -> TerrainType.MOUNTAIN
                                    else -> TerrainType.LAND
                                },
                                resourceType = TerrainResourceType.NONE
                            ),
                            influences = mutableListOf(),
                            owner = null,
                            discoveredByCountries = mutableListOf(),
                            objects = mutableListOf(),
                        )
                    )
                }
            }
            return TileContainer(tiles)
        }

    }

}

