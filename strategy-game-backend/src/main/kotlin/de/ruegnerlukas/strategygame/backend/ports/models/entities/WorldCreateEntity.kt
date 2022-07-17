package de.ruegnerlukas.strategygame.backend.ports.models.entities

data class WorldCreateEntity(
	val id: String,
	val tiles: List<TileEntity>,
)