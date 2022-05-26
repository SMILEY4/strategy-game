package de.ruegnerlukas.strategygame.backend.ports.models.world

import kotlinx.serialization.Serializable

enum class TileType {
	PLAINS,
	WATER,
	MOUNTAINS
}


@Serializable
data class Tile(
	val q: Int,
	val r: Int,
	val data: TileData,
	val entities: List<MarkerTileEntity>
)


@Serializable
data class TileData(
	val type: TileType
)

