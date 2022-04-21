package de.ruegnerlukas.strategygame.backend.external.api.models

import kotlinx.serialization.Serializable


/**
 * The data of a join-world message
 */
@Serializable
data class JoinWorldMessage(
	/**
	 * the id of the world to join
	 */
	val worldId: String,
	/**
	 * The name of the player
	 */
	val playerName: String
)