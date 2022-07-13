package de.ruegnerlukas.strategygame.backend.ports.models.world


enum class TileType {
	LAND,
	WATER,
}


data class Tile(
	val q: Int,
	val r: Int,
	val data: TileData,
	val entities: List<MarkerTileObject>
)


data class TileData(
	val type: TileType
)
