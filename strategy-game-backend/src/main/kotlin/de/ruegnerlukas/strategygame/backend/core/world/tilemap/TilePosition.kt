package de.ruegnerlukas.strategygame.backend.core.world.tilemap

/**
 * The position of a single tile
 * TODO: replace with [de.ruegnerlukas.strategygame.backend.ports.models.TilePosition]
 */
data class TilePosition(
	val q: Int,
	val r: Int,
)