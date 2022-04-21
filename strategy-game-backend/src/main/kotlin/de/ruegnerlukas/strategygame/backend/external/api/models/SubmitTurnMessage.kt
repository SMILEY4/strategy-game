package de.ruegnerlukas.strategygame.backend.external.api.models

import kotlinx.serialization.Serializable


/**
 * The data of a turn submission
 */
@Serializable
data class SubmitTurnMessage(
	/**
	 * the id of the world to join
	 */
	val worldId: String,

	/**
	 * a list of submitted commands
	 */
	val commands: List<PlaceMarkerCommand>
)


@Serializable
data class PlaceMarkerCommand(
	val q: Int,
	val r: Int
)