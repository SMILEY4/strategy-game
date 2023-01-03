package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.rules.BlockingTilesRule
import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.BasicNodeBuilder
import de.ruegnerlukas.strategygame.backend.core.pathfinding.additionals.BasicScoreCalculator
import de.ruegnerlukas.strategygame.backend.core.pathfinding.astar.AStarPathfinder
import de.ruegnerlukas.strategygame.backend.core.pathfinding.backtracking.BacktrackingPathfinder
import de.ruegnerlukas.strategygame.backend.core.world.TilemapPositionsBuilder
import de.ruegnerlukas.strategygame.backend.ports.models.*
import de.ruegnerlukas.strategygame.backend.ports.models.containers.TileContainer
import de.ruegnerlukas.strategygame.backend.shared.positionsNeighbours
import java.time.Instant
import java.util.*
import kotlin.reflect.KClass

object PathfindingBenchmarkUtils {

    fun generateRandomWorld(seed: Long, radius: Int, chanceWater: Float, pois: Set<TilePosition>): TileContainer {
        val random = Random(seed)
        val tiles = TilemapPositionsBuilder()
            .createHexagon(radius)
            .map { pos ->
                Tile(
                    tileId = "${pos.q}/${pos.r}",
                    position = pos,
                    data = TileData(
                        terrainType = if (random.nextFloat() > chanceWater || pois.contains(pos)) TileType.LAND else TileType.WATER,
                        resourceType = TileResourceType.NONE,
                    ),
                    influences = mutableListOf(),
                    owner = null,
                    discoveredByCountries = mutableListOf(),
                    content = mutableListOf(),
                )
            }
        return TileContainer(tiles)
    }


    fun run(tiles: TileContainer, start: TilePosition, end: TilePosition, pathfinderType: KClass<*>): Pair<Path<*>, Long> {
        val pathfinder = when (pathfinderType) {
            BacktrackingPathfinder::class -> BacktrackingPathfinder(
                movementCosts = mapOf(),
                rules = listOf(
                    BlockingTilesRule(setOf(TileType.WATER))
                )
            )
            AStarPathfinder::class -> AStarPathfinder(
                BasicNodeBuilder(),
                BasicScoreCalculator(),
                TerrainBasedNeighbourProvider()
            )
            else -> throw Exception("Unknown pathfinder type")
        }

        val timeStart = Instant.now()
        val path = pathfinder.find(start, end, tiles)
        val timeEnd = Instant.now()
        val duration = timeEnd.toEpochMilli() - timeStart.toEpochMilli()
        return path to duration
    }

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