package de.ruegnerlukas.strategygame.backend.ports.models.entities

data class TileEntity(
	val id: String,
	val worldId: String,
	val q: Int,
	val r: Int,
	val type: String
)