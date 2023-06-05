package de.ruegnerlukas.strategygame.backend.common.models

import java.util.Random

data class WorldSettings(
    val size: Int = 30,
    val seed: Int = Random().nextInt(),
    val singleTileType: TileType?, // if not null = all tiles will be of this type
) {
    companion object {

        fun default() = default(null)

        fun default(seed: Int?) = WorldSettings(
            size = 20,
            seed = seed ?: Random().nextInt(),
            singleTileType = null
        )

        fun landOnly() = WorldSettings(
            size = 40,
            seed = Random().nextInt(),
            singleTileType = TileType.LAND
        )

        fun waterOnly() = WorldSettings(
            size = 40,
            seed = Random().nextInt(),
            singleTileType = TileType.WATER
        )
    }
}
