package de.ruegnerlukas.strategygame.backend.external.api.message.websocket

import io.ktor.websocket.DefaultWebSocketSession
import java.util.concurrent.atomic.AtomicInteger

/**
 * A single websocket connection
 * @param session the websocket session
 */
class Connection(val session: DefaultWebSocketSession) {

	private companion object {
		var lastId = AtomicInteger(0)
	}


	/**
	 * The id of this connection (unique among the current connections).
	 */
	private val id: Int = lastId.getAndIncrement()


	/**
	 * @return the id of this connection.
	 */
	fun getId() = id

}