package de.ruegnerlukas.strategygame.backend.ports.models.entities

data class WorldExtendedEntity(
	val id: String,
	val tiles: List<TileEntity>,
)