package de.ruegnerlukas.strategygame.backend.ports.models.world

import kotlinx.serialization.Serializable

enum class TileEntityType {
	MARKER,
}


@Serializable
data class MarkerTileEntity(
	val userId: String,
	val entityType: TileEntityType = TileEntityType.MARKER
)

