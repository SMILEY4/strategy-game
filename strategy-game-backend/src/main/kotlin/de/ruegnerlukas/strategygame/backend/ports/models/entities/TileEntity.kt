package de.ruegnerlukas.strategygame.backend.ports.models.entities

data class TileEntity(
	val id: String,
	val gameId: String,
	val q: Int,
	val r: Int
)