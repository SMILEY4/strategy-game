package de.ruegnerlukas.strategygame.backend.shared.websocket

import kotlinx.serialization.Serializable

/**
 * A generic message transmitted via a websocket
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
