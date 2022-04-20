package de.ruegnerlukas.strategygame.backend.core.ports.models

import kotlinx.serialization.Serializable


/**
 * The data of a turn submission
 */
@Serializable
data class SubmitTurnData(
	/**
	 * the id of the world to join
	 */
	val worldId: String,

	/**
	 * a list of submitted commands
	 */
	val commands: List<CommandPlaceMarker>
)


@Serializable
data class CommandPlaceMarker(
	val q: Int,
	val r: Int
)