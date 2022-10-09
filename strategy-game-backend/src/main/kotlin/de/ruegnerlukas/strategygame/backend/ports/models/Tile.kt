package de.ruegnerlukas.strategygame.backend.ports.models


enum class TileType {
    LAND,
    WATER,
    MOUNTAIN,
}

enum class TileResourceType {
    NONE,
    FOREST,
    FISH,
    STONE,
    METAL
}

data class Tile(
    val q: Int,
    val r: Int,
    val type: TileType,
	val resource: TileResourceType
)
