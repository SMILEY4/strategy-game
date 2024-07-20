package io.github.smiley4.strategygame.backend.worldgen.edge

import io.github.smiley4.strategygame.backend.commondata.TerrainType
import java.util.Random

data class WorldGenSettings(
    val size: Int = 50,
    val seed: Int = Random().nextInt(),
    val singleTileType: TerrainType?, // if =/= null => all tiles will be of this type
) {
    companion object {

        fun default() = default(null)

        fun default(seed: Int?) = WorldGenSettings(
            size = 20,
            seed = seed ?: Random().nextInt(),
            singleTileType = null
        )

        fun landOnly() = WorldGenSettings(
            size = 40,
            seed = Random().nextInt(),
            singleTileType = TerrainType.LAND
        )

        fun waterOnly() = WorldGenSettings(
            size = 40,
            seed = Random().nextInt(),
            singleTileType = TerrainType.WATER
        )
    }
}
