package de.ruegnerlukas.strategygame.backend.external.api.websocket

data class WebSocketMessage(
	val connectionId: Int,
	val userId: String,
	val gameId: String,
	val type: String,
	val payload: String
)