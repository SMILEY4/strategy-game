package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced.rules.BlockingTilesRule
import de.ruegnerlukas.strategygame.backend.core.pathfinding.basic.BasicNodeBuilder
import de.ruegnerlukas.strategygame.backend.core.pathfinding.basic.BasicScoreCalculator
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.NeighbourProvider
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.Node
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.astar.AStarPathfinder
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.custom.CustomPathfinder
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.ports.models.containers.TileContainer
import de.ruegnerlukas.strategygame.backend.shared.positionsNeighbours
import io.kotest.core.spec.style.StringSpec
import java.time.Instant

fun main() {
    val seed = 1L
    val radius = 30

    val tiles = PathfindingBenchmarkUtils.generateRandomWorld(
        seed = seed,
        radius = radius,
        chanceWater = 0.3f,
        pois = setOf(TilePosition(0,-20), TilePosition(0,20))
    )

    val pathfinder = CustomPathfinder(
        movementCosts = mapOf(),
        rules = listOf(
            BlockingTilesRule(setOf(TileType.WATER))
        )
    )
    val timeStart = Instant.now()
    val path = pathfinder.find(
        TilePosition(0, -30),
        TilePosition(0, 30),
        tiles
    )
    val timeEnd = Instant.now()
    val duration = timeEnd.toEpochMilli() - timeStart.toEpochMilli()

    println("found path of length: ${path.nodes.size} in ${duration}ms")
}

class PathfindingBenchmark : StringSpec({

    "a*: benchmark random world" {
        val seed = 1L
        val radius = 30

        val tiles = PathfindingBenchmarkUtils.generateRandomWorld(
            seed = seed,
            radius = radius,
            chanceWater = 0.3f,
            pois = setOf(TilePosition(0,-20), TilePosition(0,20))
        )

        val pathfinder = AStarPathfinder(
            BasicNodeBuilder(),
            BasicScoreCalculator(),
            TerrainBasedNeighbourProvider()
        )

        val timeStart = Instant.now()
        val path = pathfinder.find(
            TilePosition(0, -20),
            TilePosition(0, 20),
            tiles
        )
        val timeEnd = Instant.now()
        val duration = timeEnd.toEpochMilli() - timeStart.toEpochMilli()

        println("found path of length: ${path.nodes.size} in ${duration}ms")
    }


    "custom: benchmark random world" {
        val seed = 1L
        val radius = 30

        val tiles = PathfindingBenchmarkUtils.generateRandomWorld(
            seed = seed,
            radius = radius,
            chanceWater = 0.3f,
            pois = setOf(TilePosition(0,-20), TilePosition(0,20))
        )

        val pathfinder = CustomPathfinder(
            movementCosts = mapOf(),
            rules = listOf(
                BlockingTilesRule(setOf(TileType.WATER))
            )
        )
        val timeStart = Instant.now()
        val path = pathfinder.find(
            TilePosition(0, -30),
            TilePosition(0, 30),
            tiles
        )
        val timeEnd = Instant.now()
        val duration = timeEnd.toEpochMilli() - timeStart.toEpochMilli()

        println("found path of length: ${path.nodes.size} in ${duration}ms")
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
    }

}