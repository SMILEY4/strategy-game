package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.rules.*
import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.ExtendedScoreCalculator
import de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced.rules.*
import de.ruegnerlukas.strategygame.backend.core.pathfinding.backtracking.BacktrackingPathfinder
import de.ruegnerlukas.strategygame.backend.ports.models.*
import de.ruegnerlukas.strategygame.backend.ports.models.containers.TileContainer
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldBeEmpty
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.floats.shouldBeWithinPercentageOf

class AdvancedPathfindingTest : StringSpec({

    "basic path with blocking terrain and custom movement cost" {

        val tiles = buildTiles(
            listOf(
                listOf(0, 0, 0),
                listOf(1, 1, 0),
                listOf(0, 2, 1),
                listOf(0, 0, 0),
            )
        )

        val pathfinder = BacktrackingPathfinder(
            movementCosts = mapOf(
                TileType.WATER to 1f,
                TileType.MOUNTAIN to 2f,
                TileType.LAND to 1f
            ),
            rules = listOf(
                BlockingTilesRule(setOf(TileType.WATER))
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
        path.nodes.last().g.shouldBeWithinPercentageOf(7.0f, 0.1)

    }

    "expensive path is the only one shorter than max path length" {

        val tiles = buildTiles(
            listOf(
                listOf(0, 0, 0),
                listOf(2, 1, 0),
                listOf(0, 0, 1),
                listOf(0, 0, 0),
            )
        )

        val pathfinder = BacktrackingPathfinder(
            movementCosts = mapOf(
                TileType.WATER to 1f,
                TileType.MOUNTAIN to 10f,
                TileType.LAND to 1f
            ),
            rules = listOf(
                BlockingTilesRule(setOf(TileType.WATER)),
                MaxPathLengthRule(6)
            )
        )

        val path = pathfinder.find(
            TilePosition(0, 0),
            TilePosition(2, 3),
            tiles
        )

        path.nodes.map { it.tile.position } shouldContainExactly listOf(
            TilePosition(0, 0),
            TilePosition(0, 1),
            TilePosition(0, 2),
            TilePosition(1, 2),
            TilePosition(1, 3),
            TilePosition(2, 3),
        )
        path.nodes.last().g.shouldBeWithinPercentageOf(14.0f, 0.1)

    }

    "all paths longer than max path length" {
        val tiles = buildTiles(
            listOf(
                listOf(0, 0, 0),
                listOf(2, 1, 0),
                listOf(0, 0, 1),
                listOf(0, 0, 0),
            )
        )

        val pathfinder = BacktrackingPathfinder(
            movementCosts = mapOf(
                TileType.WATER to 1f,
                TileType.MOUNTAIN to 10f,
                TileType.LAND to 1f
            ),
            rules = listOf(
                BlockingTilesRule(setOf(TileType.WATER)),
                MaxPathLengthRule(4)
            )
        )

        val path = pathfinder.find(
            TilePosition(0, 0),
            TilePosition(2, 3),
            tiles
        )

        path.nodes.shouldBeEmpty()
    }

    "path costs less than max path cost" {
        val tiles = buildTiles(
            listOf(
                listOf(0, 0, 0),
                listOf(0, 1, 0),
                listOf(0, 0, 0),
            )
        )

        val movementCosts = mapOf(
            TileType.WATER to 1f,
            TileType.MOUNTAIN to 10f,
            TileType.LAND to 1f
        )
        val pathfinder = BacktrackingPathfinder(
            movementCosts = movementCosts,
            rules = listOf(
                BlockingTilesRule(setOf(TileType.WATER)),
                MaxPathCostRule(10f, ExtendedScoreCalculator(movementCosts))
            )
        )

        val path = pathfinder.find(
            TilePosition(1, 0),
            TilePosition(1, 2),
            tiles
        )

        path.nodes.map { it.tile.position } shouldContainExactly listOf(
            TilePosition(1, 0),
            TilePosition(2, 0),
            TilePosition(2, 1),
            TilePosition(1, 2),
        )
        path.nodes.last().g.shouldBeWithinPercentageOf(3.0f, 0.1)

    }

    "one of two paths cost more than max path cost" {
        val tiles = buildTiles(
            listOf(
                listOf(0, 0, 0),
                listOf(0, 1, 2),
                listOf(0, 0, 0),
            )
        )

        val movementCosts = mapOf(
            TileType.WATER to 1f,
            TileType.MOUNTAIN to 10f,
            TileType.LAND to 1f
        )
        val pathfinder = BacktrackingPathfinder(
            movementCosts = movementCosts,
            rules = listOf(
                BlockingTilesRule(setOf(TileType.WATER)),
                MaxPathCostRule(10f, ExtendedScoreCalculator(movementCosts))
            )
        )

        val path = pathfinder.find(
            TilePosition(1, 0),
            TilePosition(1, 2),
            tiles
        )

        path.nodes.map { it.tile.position } shouldContainExactly listOf(
            TilePosition(1, 0),
            TilePosition(0, 1),
            TilePosition(0, 2),
            TilePosition(1, 2),
        )
        path.nodes.last().g.shouldBeWithinPercentageOf(3.0f, 0.1)
    }

    "all paths cost more than max path cost" {
        val tiles = buildTiles(
            listOf(
                listOf(0, 0, 0),
                listOf(2, 1, 2),
                listOf(0, 0, 0),
            )
        )

        val movementCosts = mapOf(
            TileType.WATER to 1f,
            TileType.MOUNTAIN to 10f,
            TileType.LAND to 1f
        )
        val pathfinder = BacktrackingPathfinder(
            movementCosts = movementCosts,
            rules = listOf(
                BlockingTilesRule(setOf(TileType.WATER)),
                MaxPathCostRule(10f, ExtendedScoreCalculator(movementCosts))
            )
        )

        val path = pathfinder.find(
            TilePosition(1, 0),
            TilePosition(1, 2),
            tiles
        )

        path.nodes.shouldBeEmpty()
    }

    "valid path starts in unclaimed tile and crosses through max allowed provinces" {
        val tiles = buildTiles(
            listOf(
                listOf(0, 0, 0),
                listOf(0, 1, 0),
                listOf(0, 1, 0),
                listOf(0, 1, 0),
                listOf(0, 0, 0),
            ),
            listOf(
                listOf(0, 0, 0),
                listOf(1, 1, 1),
                listOf(2, 2, 2),
                listOf(3, 3, 3),
                listOf(0, 0, 0),
            )
        )

        val pathfinder = BacktrackingPathfinder(
            movementCosts = mapOf(),
            rules = listOf(
                BlockingTilesRule(setOf(TileType.WATER)),
                MaxProvincesRule(3)
            )
        )

        val path = pathfinder.find(
            TilePosition(1, 0),
            TilePosition(1, 4),
            tiles
        )

        path.nodes.map { it.tile.position } shouldContainExactly listOf(
            TilePosition(1, 0),
            TilePosition(2, 0),
            TilePosition(2, 1),
            TilePosition(2, 2),
            TilePosition(2, 3),
            TilePosition(1, 4),
        )
    }

    "valid path starts in province and crosses through multiple provinces" {
        val tiles = buildTiles(
            listOf(
                listOf(0, 0, 0),
                listOf(0, 1, 0),
                listOf(0, 1, 0),
                listOf(0, 1, 0),
                listOf(0, 0, 0),
            ),
            listOf(
                listOf(1, 1, 1),
                listOf(2, 2, 2),
                listOf(0, 0, 0),
                listOf(3, 3, 3),
                listOf(4, 4, 4),
            )
        )

        val pathfinder = BacktrackingPathfinder(
            movementCosts = mapOf(),
            rules = listOf(
                BlockingTilesRule(setOf(TileType.WATER)),
                MaxProvincesRule(10)
            )
        )

        val path = pathfinder.find(
            TilePosition(1, 0),
            TilePosition(1, 4),
            tiles
        )

        path.nodes.map { it.tile.position } shouldContainExactly listOf(
            TilePosition(1, 0),
            TilePosition(2, 0),
            TilePosition(2, 1),
            TilePosition(2, 2),
            TilePosition(2, 3),
            TilePosition(1, 4),
        )
    }

    "valid path crosses through unclaimed land instead of multiple provinces" {
        val tiles = buildTiles(
            listOf(
                listOf(0, 0, 0),
                listOf(0, 1, 0),
                listOf(0, 1, 0),
                listOf(0, 1, 0),
                listOf(0, 0, 0),
            ),
            listOf(
                listOf(1, 1, 1),
                listOf(2, 0, 0),
                listOf(3, 0, 0),
                listOf(4, 0, 0),
                listOf(5, 5, 5),
            )
        )

        val pathfinder = BacktrackingPathfinder(
            movementCosts = mapOf(),
            rules = listOf(
                BlockingTilesRule(setOf(TileType.WATER)),
                MaxProvincesRule(3)
            )
        )

        val path = pathfinder.find(
            TilePosition(1, 0),
            TilePosition(1, 4),
            tiles
        )

        path.nodes.map { it.tile.position } shouldContainExactly listOf(
            TilePosition(1, 0),
            TilePosition(2, 0),
            TilePosition(2, 1),
            TilePosition(2, 2),
            TilePosition(2, 3),
            TilePosition(1, 4),
        )
    }

    "path may not cross more than max allowed provinces " {
        val tiles = buildTiles(
            listOf(
                listOf(0, 0, 0),
                listOf(0, 1, 0),
                listOf(0, 1, 0),
                listOf(0, 1, 0),
                listOf(0, 0, 0),
            ),
            listOf(
                listOf(1, 1, 1),
                listOf(2, 2, 2),
                listOf(3, 3, 3),
                listOf(4, 4, 4),
                listOf(5, 5, 5),
            )
        )

        val pathfinder = BacktrackingPathfinder(
            movementCosts = mapOf(),
            rules = listOf(
                BlockingTilesRule(setOf(TileType.WATER)),
                MaxProvincesRule(3)
            )
        )

        val path = pathfinder.find(
            TilePosition(1, 0),
            TilePosition(1, 4),
            tiles
        )

        path.nodes.shouldBeEmpty()
    }

    "path allowed two switch between water/land at specified positions" {
        val tiles = buildTiles(
            listOf(
                listOf(0, 0, 0, 0),
                listOf(1, 1, 1, 1),
                listOf(1, 1, 1, 1),
                listOf(0, 0, 0, 0),
            ),
        )

        val pathfinder = BacktrackingPathfinder(
            movementCosts = mapOf(),
            rules = listOf(
                SwitchFromToWaterViaPointsRule(
                    setOf(
                        TilePosition(2, 0),
                        TilePosition(3, 3)
                    )
                )
            )
        )

        val path = pathfinder.find(
            TilePosition(0, 0),
            TilePosition(0, 3),
            tiles
        )

        path.nodes.map { it.tile.position } shouldContainExactly listOf(
            TilePosition(0, 0),
            TilePosition(1, 0),
            TilePosition(2, 0),
            TilePosition(2, 1),
            TilePosition(2, 2),
            TilePosition(3, 2),
            TilePosition(3, 3),
            TilePosition(2, 3),
            TilePosition(1, 3),
            TilePosition(0, 3),
        )

    }

    "path allowed two switch between water/land, but no switching point" {
        val tiles = buildTiles(
            listOf(
                listOf(0, 0, 0, 0),
                listOf(1, 1, 1, 1),
                listOf(1, 1, 1, 1),
                listOf(0, 0, 0, 0),
            ),
        )

        val pathfinder = BacktrackingPathfinder(
            movementCosts = mapOf(),
            rules = listOf(
                SwitchFromToWaterViaPointsRule(
                    setOf(
                        TilePosition(2, 0),
                    )
                )
            )
        )

        val path = pathfinder.find(
            TilePosition(0, 0),
            TilePosition(0, 3),
            tiles
        )

        path.nodes.shouldBeEmpty()
    }


}) {

    companion object {

        fun buildTiles(ids: List<List<Int>>, provinceIds: List<List<Int>>? = null): TileContainer {
            val tiles = mutableListOf<Tile>()
            ids.forEachIndexed { r, qIds ->
                qIds.forEachIndexed { q, id ->
                    tiles.add(
                        Tile(
                            tileId = "$q/$r",
                            position = TilePosition(q, r),
                            data = TileData(
                                terrainType = when (id) {
                                    1 -> TileType.WATER
                                    2 -> TileType.MOUNTAIN
                                    else -> TileType.LAND
                                },
                                resourceType = TileResourceType.NONE
                            ),
                            influences = mutableListOf(),
                            owner = when (val pid = provinceIds?.let { it[r][q] } ?: 0) {
                                0 -> null
                                else -> TileOwner(
                                    countryId = "testCountry",
                                    provinceId = "$pid",
                                    cityId = "testCity"
                                )
                            },
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