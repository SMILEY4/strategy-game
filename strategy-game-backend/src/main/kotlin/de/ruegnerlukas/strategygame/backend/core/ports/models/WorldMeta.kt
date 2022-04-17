package de.ruegnerlukas.strategygame.backend.core.ports.models

import kotlinx.serialization.Serializable

/**
 * Information about a specific world
 */
@Serializable
data class WorldMeta(
	/**
	 * the id of the world
	 */
	val worldId: String,
)
