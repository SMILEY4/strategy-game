package de.ruegnerlukas.strategygame.backend.core.ports.models

/**
 * Represents a single tile
 */
data class Tile(
	val q: Int,
	val r: Int,
	val tileId: Int
)