package de.ruegnerlukas.strategygame.backend.ports.models


enum class TileType {
	LAND,
	WATER,
	MOUNTAIN,
}


data class Tile(
	val q: Int,
	val r: Int,
	val type: TileType
)
