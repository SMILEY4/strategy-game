package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.BasicNodeBuilder
import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.BasicScoreCalculator
import de.ruegnerlukas.strategygame.backend.core.pathfinding.astar.AStarPathfinder
import de.ruegnerlukas.strategygame.backend.ports.models.*
import de.ruegnerlukas.strategygame.backend.ports.models.containers.TileContainer
import de.ruegnerlukas.strategygame.backend.common.utils.distance
import de.ruegnerlukas.strategygame.backend.common.utils.positionsNeighbours
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
            BasicNodeBuilder(),
            BasicScoreCalculator(),
            TerrainBasedNeighbourProvider()
        )

        val path = pathfinder.find(
            TilePosition(0, 0),
            TilePosition(2, 3),
            tiles
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
            BasicNodeBuilder(),
            BasicScoreCalculator(),
            TerrainBasedNeighbourProvider()
        )

        val path = pathfinder.find(
            TilePosition(0, 0),
            TilePosition(1, 2),
            tiles
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
            BasicNodeBuilder(),
            BasicScoreCalculator(),
            TerrainBasedNeighbourProvider()
        )

        val path = pathfinder.find(
            TilePosition(0, 0),
            TilePosition(0, 0),
            tiles
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
            BasicNodeBuilder(),
            BasicScoreCalculator(),
            TerrainBasedNeighbourProvider()
        )

        val path = pathfinder.find(
            TilePosition(0, 0),
            TilePosition(1, 0),
            tiles
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
            BasicNodeBuilder(),
            TerrainBasedScoreCalculator(),
            TerrainBasedNeighbourProvider()
        )

        val path = pathfinder.find(
            TilePosition(1, 0),
            TilePosition(1, 3),
            tiles
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

        class TerrainBasedNeighbourProvider : NeighbourProvider<Node> {
            override fun get(node: Node, tiles: TileContainer, consumer: (neighbour: Tile) -> Unit) {
                positionsNeighbours(node.tile.position) { q, r ->
                    val neighbour = tiles.get(q, r)
                    if (neighbour != null && neighbour.data.terrainType != TileType.WATER) {
                        consumer(neighbour)
                    }
                }
            }
        }

        class TerrainBasedScoreCalculator : ScoreCalculator<Node> {
            override fun f(g: Float, h: Float): Float {
                return g + h
            }

            override fun g(previousNode: Node, tile: Tile): Float {
                return previousNode.g + ((movementCost(previousNode.tile) + movementCost(tile)) / 2f)
            }

            override fun h(tile: Tile, destination: Tile): Float {
                return tile.position.distance(destination.position).toFloat()
            }

            private fun movementCost(tile: Tile): Float {
                return when(tile.data.terrainType) {
                    TileType.LAND -> 1f
                    TileType.WATER -> 99999f
                    TileType.MOUNTAIN -> 2f
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
                                terrainType = when(id) {
                                    1 -> TileType.WATER
                                    2 -> TileType.MOUNTAIN
                                    else -> TileType.LAND
                                },
                                resourceType = TileResourceType.NONE
                            ),
                            influences = mutableListOf(),
                            owner = null,
                            discoveredByCountries = mutableListOf(),
                            content = mutableListOf(),
                        )
                    )
                }
            }
            return TileContainer(tiles)
        }

    }

}

