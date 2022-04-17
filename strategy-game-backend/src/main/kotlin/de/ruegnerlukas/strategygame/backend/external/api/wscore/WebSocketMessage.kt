package de.ruegnerlukas.strategygame.backend.external.api.wscore

import kotlinx.serialization.Serializable

/**
 * A message transmitted via a websocket
 */
@Serializable
data class WebSocketMessage(
	/**
	 * The type of this message
	 */
	val type: String,
	/**
	 * The payload of this message as a string (e.g. can be a json-string)
	 */
	val payload: String,
)
