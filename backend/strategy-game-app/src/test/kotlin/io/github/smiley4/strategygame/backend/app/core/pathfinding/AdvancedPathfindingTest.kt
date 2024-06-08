package io.github.smiley4.strategygame.backend.app.core.pathfinding

import io.github.smiley4.strategygame.backend.app.core.pathfinding.utils.BlockingTilesRule
import io.github.smiley4.strategygame.backend.app.core.pathfinding.utils.MaxPathCostRule
import io.github.smiley4.strategygame.backend.app.core.pathfinding.utils.MaxPathLengthRule
import io.github.smiley4.strategygame.backend.app.core.pathfinding.utils.MaxProvincesRule
import io.github.smiley4.strategygame.backend.app.core.pathfinding.utils.NextNodeRule
import io.github.smiley4.strategygame.backend.app.core.pathfinding.utils.SwitchFromToWaterViaPointsRule
import io.github.smiley4.strategygame.backend.app.core.pathfinding.utils.TestNode
import io.github.smiley4.strategygame.backend.app.core.pathfinding.utils.node
import io.github.smiley4.strategygame.backend.common.models.Tile
import io.github.smiley4.strategygame.backend.common.models.TileData
import io.github.smiley4.strategygame.backend.common.models.TileOwner
import io.github.smiley4.strategygame.backend.common.models.TilePosition
import io.github.smiley4.strategygame.backend.common.models.terrain.TerrainResourceType
import io.github.smiley4.strategygame.backend.common.models.terrain.TerrainType
import io.github.smiley4.strategygame.backend.common.utils.distance
import io.github.smiley4.strategygame.backend.common.utils.positionsNeighbours
import io.github.smiley4.strategygame.backend.engine.ports.models.TileContainer
import io.github.smiley4.strategygame.backend.pathfinding.NeighbourProvider
import io.github.smiley4.strategygame.backend.pathfinding.ScoreCalculator
import io.github.smiley4.strategygame.backend.pathfinding.algorithms.backtracking.BacktrackingPathfinder
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
            AdvancedNeighbourProvider(tiles).withRules(
                BlockingTilesRule(setOf(TerrainType.WATER))
            ),
            AdvancedScoreCalculator(
                mapOf(
                    TerrainType.WATER to 1f,
                    TerrainType.MOUNTAIN to 2f,
                    TerrainType.LAND to 1f
                )
            )
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
            AdvancedNeighbourProvider(tiles).withRules(
                BlockingTilesRule(setOf(TerrainType.WATER)),
                MaxPathLengthRule(6)
            ),
            AdvancedScoreCalculator(
                mapOf(
                    TerrainType.WATER to 1f,
                    TerrainType.MOUNTAIN to 10f,
                    TerrainType.LAND to 1f
                )
            )
        )
        val path = pathfinder.find(
            tiles.get(0, 0).node(),
            tiles.get(2, 3).node(),
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
            AdvancedNeighbourProvider(tiles).withRules(
                BlockingTilesRule(setOf(TerrainType.WATER)),
                MaxPathLengthRule(4)
            ),
            AdvancedScoreCalculator(
                mapOf(
                    TerrainType.WATER to 1f,
                    TerrainType.MOUNTAIN to 10f,
                    TerrainType.LAND to 1f
                )
            )
        )
        val path = pathfinder.find(
            tiles.get(0, 0).node(),
            tiles.get(2, 3).node(),
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
            TerrainType.WATER to 1f,
            TerrainType.MOUNTAIN to 10f,
            TerrainType.LAND to 1f
        )
        val pathfinder = BacktrackingPathfinder(
            AdvancedNeighbourProvider(tiles).withRules(
                BlockingTilesRule(setOf(TerrainType.WATER)),
                MaxPathCostRule(10f, AdvancedScoreCalculator(movementCosts))
            ),
            AdvancedScoreCalculator(movementCosts)
        )
        val path = pathfinder.find(
            tiles.get(1, 0).node(),
            tiles.get(1, 2).node(),
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
            TerrainType.WATER to 1f,
            TerrainType.MOUNTAIN to 10f,
            TerrainType.LAND to 1f
        )
        val pathfinder = BacktrackingPathfinder(
            AdvancedNeighbourProvider(tiles).withRules(
                BlockingTilesRule(setOf(TerrainType.WATER)),
                MaxPathCostRule(10f, AdvancedScoreCalculator(movementCosts))
            ),
            AdvancedScoreCalculator(movementCosts)
        )
        val path = pathfinder.find(
            tiles.get(1, 0).node(),
            tiles.get(1, 2).node(),
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
            TerrainType.WATER to 1f,
            TerrainType.MOUNTAIN to 10f,
            TerrainType.LAND to 1f
        )
        val pathfinder = BacktrackingPathfinder(
            AdvancedNeighbourProvider(tiles).withRules(
                BlockingTilesRule(setOf(TerrainType.WATER)),
                MaxPathCostRule(10f, AdvancedScoreCalculator(movementCosts))
            ),
            AdvancedScoreCalculator(movementCosts)
        )
        val path = pathfinder.find(
            tiles.get(1, 0).node(),
            tiles.get(1, 2).node(),
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
            AdvancedNeighbourProvider(tiles).withRules(
                BlockingTilesRule(setOf(TerrainType.WATER)),
                MaxProvincesRule(3)
            ),
            AdvancedScoreCalculator(emptyMap())
        )
        val path = pathfinder.find(
            tiles.get(1, 0).node(),
            tiles.get(1, 4).node(),
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
            AdvancedNeighbourProvider(tiles).withRules(
                BlockingTilesRule(setOf(TerrainType.WATER)),
                MaxProvincesRule(10)
            ),
            AdvancedScoreCalculator(emptyMap())
        )
        val path = pathfinder.find(
            tiles.get(1, 0).node(),
            tiles.get(1, 4).node(),
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
            AdvancedNeighbourProvider(tiles).withRules(
                BlockingTilesRule(setOf(TerrainType.WATER)),
                MaxProvincesRule(3)
            ),
            AdvancedScoreCalculator(emptyMap())
        )
        val path = pathfinder.find(
            tiles.get(1, 0).node(),
            tiles.get(1, 4).node(),
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
            AdvancedNeighbourProvider(tiles).withRules(
                BlockingTilesRule(setOf(TerrainType.WATER)),
                MaxProvincesRule(3)
            ),
            AdvancedScoreCalculator(emptyMap())
        )
        val path = pathfinder.find(
            tiles.get(1, 0).node(),
            tiles.get(1, 4).node(),
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
            AdvancedNeighbourProvider(tiles).withRules(
                SwitchFromToWaterViaPointsRule(
                    setOf(
                        TilePosition(2, 0),
                        TilePosition(3, 3)
                    )
                )
            ),
            AdvancedScoreCalculator(emptyMap())
        )
        val path = pathfinder.find(
            tiles.get(0, 0).node(),
            tiles.get(0, 3).node(),
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
            AdvancedNeighbourProvider(tiles).withRules(
                SwitchFromToWaterViaPointsRule(
                    setOf(
                        TilePosition(2, 0),
                    )
                )

            ),
            AdvancedScoreCalculator(emptyMap())
        )
        val path = pathfinder.find(
            tiles.get(0, 0).node(),
            tiles.get(0, 3).node(),
        )
        path.nodes.shouldBeEmpty()
    }

}) {

    companion object {

        class AdvancedNeighbourProvider(private val tiles: TileContainer) : NeighbourProvider<TestNode> {

            private val rules = mutableListOf<NextNodeRule<TestNode>>()

            fun withRules(vararg rules: NextNodeRule<TestNode>): AdvancedNeighbourProvider {
                this.rules.clear()
                this.rules.addAll(rules)
                return this
            }

            private fun allRulesApply(prev: TestNode, next: TestNode): Boolean {
                return rules.all { it.evaluate(prev, next) }
            }

            override fun getNeighbours(current: TestNode, consumer: (neighbour: TestNode) -> Unit) {
                positionsNeighbours(current.tile.position) { q, r ->
                    val neighbourTile = tiles.get(q, r)
                    if (neighbourTile != null) {
                        val neighbourNode = TestNode(neighbourTile,
                            pathLength = current.pathLength + 1,
                            visitedProvinces = current.visitedProvinces + (neighbourTile.owner?.provinceId?.let { setOf(it) } ?: setOf()),
                            prevNode = current
                        )
                        if (allRulesApply(current, neighbourNode)) {
                            consumer(neighbourNode)
                        }
                    }
                }
            }

        }

        class AdvancedScoreCalculator(private val movementCosts: Map<TerrainType, Float>) : ScoreCalculator<TestNode> {

            override fun f(g: Float, h: Float): Float {
                return g + h
            }

            override fun h(node: TestNode, destination: TestNode): Float {
                return node.tile.position.distance(destination.tile.position).toFloat()
            }

            override fun g(prev: TestNode, next: TestNode): Float {
                return prev.g + movementCost(prev.tile) / 2f + movementCost(next.tile) / 2f
            }

            private fun movementCost(tile: Tile): Float {
                return movementCosts[tile.data.terrainType] ?: 1f
            }

        }

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
                                    1 -> TerrainType.WATER
                                    2 -> TerrainType.MOUNTAIN
                                    else -> TerrainType.LAND
                                },
                                resourceType = TerrainResourceType.NONE
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
                            objects = mutableListOf(),
                        )
                    )
                }
            }
            return TileContainer(tiles)
        }

    }

}