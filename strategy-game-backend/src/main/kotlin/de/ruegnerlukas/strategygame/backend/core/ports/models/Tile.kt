package de.ruegnerlukas.strategygame.backend.core.ports.models

import kotlinx.serialization.Serializable

/**
 * Represents a single tile
 */
@Serializable
data class Tile(
	val q: Int,
	val r: Int,
	val tileId: Int
)