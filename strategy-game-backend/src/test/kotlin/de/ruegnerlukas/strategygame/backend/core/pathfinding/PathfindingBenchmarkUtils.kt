package de.ruegnerlukas.strategygame.backend.core.pathfinding

import de.ruegnerlukas.strategygame.backend.core.world.TilemapPositionsBuilder
import de.ruegnerlukas.strategygame.backend.ports.models.*
import de.ruegnerlukas.strategygame.backend.ports.models.containers.TileContainer
import java.util.*

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

}