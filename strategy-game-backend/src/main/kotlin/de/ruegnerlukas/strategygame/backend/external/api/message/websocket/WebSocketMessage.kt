package de.ruegnerlukas.strategygame.backend.external.api.message.websocket

data class WebSocketMessage(
	val connectionId: Int,
	val userId: String,
	val gameId: String,
	val type: String,
	val payload: String
)