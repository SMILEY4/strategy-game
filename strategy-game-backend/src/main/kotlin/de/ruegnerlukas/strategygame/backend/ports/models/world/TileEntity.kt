package de.ruegnerlukas.strategygame.backend.ports.models.world


enum class TileEntityType {
	MARKER,
}


data class MarkerTileEntity(
	val userId: String,
	val entityType: TileEntityType = TileEntityType.MARKER
)

