package de.ruegnerlukas.strategygame.backend.ports.models.world

import java.util.Random

data class WorldSettings(
	val seed: Int = Random().nextInt(),
	val singleTileType: TileType?, // if not null = all tiles will be of this type
) {
	companion object {
		fun default() = WorldSettings(
			seed = Random().nextInt(),
			singleTileType = null
		)
	}
}
