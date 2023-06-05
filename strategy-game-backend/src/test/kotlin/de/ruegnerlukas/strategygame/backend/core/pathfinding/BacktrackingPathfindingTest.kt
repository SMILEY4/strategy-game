package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.ExtendedNeighbourProvider
import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.ExtendedNodeBuilder
import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.ExtendedScoreCalculator
import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.rules.BlockingTilesRule
import de.ruegnerlukas.strategygame.backend.core.pathfinding.backtracking.BacktrackingPathfinder
import de.ruegnerlukas.strategygame.backend.ports.models.*
import de.ruegnerlukas.strategygame.backend.ports.models.containers.TileContainer
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.floats.shouldBeWithinPercentageOf

class BacktrackingPathfindingTest : StringSpec({

    "basic path with blocking terrain" {

        val tiles = buildTiles(
            listOf(
                listOf(0, 0, 0),
                listOf(1, 1, 0),
                listOf(0, 0, 1),
                listOf(0, 0, 0),
            )
        )

        val pathfinder = BacktrackingPathfinder(
            ExtendedNodeBuilder(),
            ExtendedScoreCalculator(mapOf()),
            ExtendedNeighbourProvider().withRules(
                listOf(
                    BlockingTilesRule(setOf(TileType.WATER))
                )
            )
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

        val pathfinder = BacktrackingPathfinder(
            ExtendedNodeBuilder(),
            ExtendedScoreCalculator(mapOf()),
            ExtendedNeighbourProvider().withRules(
                listOf(
                    BlockingTilesRule(setOf(TileType.WATER))
                )
            )
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

        val pathfinder = BacktrackingPathfinder(
            ExtendedNodeBuilder(),
            ExtendedScoreCalculator(mapOf()),
            ExtendedNeighbourProvider().withRules(
                listOf(
                    BlockingTilesRule(setOf(TileType.WATER))
                )
            )
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

        val pathfinder = BacktrackingPathfinder(
            ExtendedNodeBuilder(),
            ExtendedScoreCalculator(mapOf()),
            ExtendedNeighbourProvider().withRules(
                listOf(
                    BlockingTilesRule(setOf(TileType.WATER))
                )
            )
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

        val pathfinder = BacktrackingPathfinder(
            ExtendedNodeBuilder(),
            ExtendedScoreCalculator(mapOf(
                TileType.WATER to 9999f,
                TileType.MOUNTAIN to 2f,
                TileType.LAND to 1f
            )),
            ExtendedNeighbourProvider().withRules(
                listOf(
                    BlockingTilesRule(setOf(TileType.WATER))
                )
            )
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
