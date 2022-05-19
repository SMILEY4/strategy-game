package de.ruegnerlukas.strategygame.backend.ports.models.game

import kotlinx.serialization.Serializable

/**
 * Represents a single tile
 */
@Serializable
data class Tile(
	/**
	 * the q-coordinate
	 */
	val q: Int,
	/**
	 * the r-coordinate
	 */
	val r: Int,
	/**
	 * the id/type of this tile
	 */
	val tileId: Int
)