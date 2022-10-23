package de.ruegnerlukas.strategygame.backend.ports.models

import java.util.Random

data class WorldSettings(
    val size: Int = 30,
    val seed: Int = Random().nextInt(),
    val singleTileType: TileType?, // if not null = all tiles will be of this type
) {
    companion object {
        fun default() = WorldSettings(
            size = 20,
            seed = Random().nextInt(),
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
