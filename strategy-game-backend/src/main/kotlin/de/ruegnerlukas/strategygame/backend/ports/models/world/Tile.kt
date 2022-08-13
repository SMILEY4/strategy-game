package de.ruegnerlukas.strategygame.backend.ports.models.world


enum class TileType {
	LAND,
	WATER,
}


data class Tile(
	val q: Int,
	val r: Int,
	val type: TileType
)
