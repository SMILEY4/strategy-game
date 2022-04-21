package de.ruegnerlukas.strategygame.backend.ports.models

import kotlinx.serialization.Serializable

/**
 * The (current) state of a world
 */
@Serializable
data class WorldState(
	/**
	 * the map
	 */
	val map: Tilemap
)