package de.ruegnerlukas.strategygame.backend.core.ports.models

import kotlinx.serialization.Serializable


/**
 * The data of a join-world message
 */
@Serializable
data class JoinWorldData(
	/**
	 * the id of the world to join
	 */
	val worldId: String
)