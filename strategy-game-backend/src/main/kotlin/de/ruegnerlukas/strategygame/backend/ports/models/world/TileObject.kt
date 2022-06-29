package de.ruegnerlukas.strategygame.backend.ports.models.world


enum class TileObjectType {
	MARKER,
}


data class MarkerTileObject(
	val userId: String,
	val entityType: TileObjectType = TileObjectType.MARKER
)

