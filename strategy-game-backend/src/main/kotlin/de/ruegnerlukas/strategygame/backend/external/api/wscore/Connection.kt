package de.ruegnerlukas.strategygame.backend.external.api.wscore

import io.ktor.websocket.DefaultWebSocketSession
import java.util.concurrent.atomic.AtomicInteger

/**
 * A single websocket connection
 * @param session the websocket session
 */
class Connection(val session: DefaultWebSocketSession) {

	companion object {
		var lastId = AtomicInteger(0)
	}

	private val id: Int = lastId.getAndIncrement()


	/**
	 * @return the id of this websocket. Unique among the currently active connections (at least).
	 */
	fun getId(): Int {
		return id
	}

}