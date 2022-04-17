package de.ruegnerlukas.strategygame.backend.external.api.wscore

import io.ktor.websocket.DefaultWebSocketSession
import java.util.concurrent.atomic.AtomicInteger

class Connection(val session: DefaultWebSocketSession) {

	companion object {
		var lastId = AtomicInteger(0)
	}

	val id: Int = lastId.getAndIncrement()

}