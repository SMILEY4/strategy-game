package de.ruegnerlukas.strategygame.backend.shared.websocket

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
	 * The id of this connection.
	 */
	private val id: Int = lastId.getAndIncrement()


	/**
	 * @return the id of this connection.
	 */
	fun getId() = id

}