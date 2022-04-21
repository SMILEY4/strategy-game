package de.ruegnerlukas.strategygame.backend.ports.models

import kotlinx.serialization.Serializable

/**
 * Represents the map as a collection of [Tile]s
 */
@Serializable
data class Tilemap(
	/**
	 * the tiles of this map
	 */
	val tiles: List<Tile>
)
