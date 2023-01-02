package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.core.pathfinding.advanced.rules.BlockingTilesRule
import de.ruegnerlukas.strategygame.backend.core.pathfinding.basic.BasicNodeBuilder
import de.ruegnerlukas.strategygame.backend.core.pathfinding.basic.BasicScoreCalculator
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.NeighbourProvider
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.Node
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.Path
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.Pathfinder
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.astar.AStarPathfinder
import de.ruegnerlukas.strategygame.backend.core.pathfinding.core.custom.CustomPathfinder
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
            CustomPathfinder::class -> CustomPathfinder(
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