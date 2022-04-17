package de.ruegnerlukas.strategygame.backend.external.api.wscore

import kotlinx.serialization.Serializable

@Serializable
data class WebSocketMessage(
	val type: String,
	val payload: String,
)
