package de.ruegnerlukas.strategygame.backend.core.ports.models

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