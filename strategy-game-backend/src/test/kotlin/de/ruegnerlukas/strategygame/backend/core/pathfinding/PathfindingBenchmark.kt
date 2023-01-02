package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.custom.CustomPathfinder
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition

fun main() {
    val seed = 1L
    val radius = 20
    val start = TilePosition(0, -6)
    val end = TilePosition(0, 6)

    val tiles = PathfindingBenchmarkUtils.generateRandomWorld(
        seed = seed,
        radius = radius,
        chanceWater = 0.3f,
        pois = setOf(start, end)
    )
    println("tile-count = ${tiles.size}")

    val result = PathfindingBenchmarkUtils.run(tiles, start, end, CustomPathfinder::class)
//    val result = PathfindingBenchmarkUtils.run(tiles, start, end, AStarPathfinder::class)

    println("found path of length: ${result.first.nodes.size} in ${result.second}ms")
    println(result.first.nodes.joinToString(" -> ") { "${it.tile.position.q}/${it.tile.position.r}" })

}