package de.ruegnerlukas.strategygame.backend.ports.models

import kotlinx.serialization.Serializable

/**
 * Meta-Information about a specific world
 */
@Serializable
data class WorldMeta(
	/**
	 * the id of the world
	 */
	val worldId: String,
)
