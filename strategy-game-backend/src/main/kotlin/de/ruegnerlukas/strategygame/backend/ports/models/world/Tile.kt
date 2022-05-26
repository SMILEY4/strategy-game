package de.ruegnerlukas.strategygame.backend.ports.models.world


enum class TileType {
	PLAINS,
	WATER,
	MOUNTAINS
}


data class Tile(
	val q: Int,
	val r: Int,
	val data: TileData,
	val entities: List<MarkerTileEntity>
)


data class TileData(
	val type: TileType
)
