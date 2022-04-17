package de.ruegnerlukas.strategygame.backend.external.api.wscore

import de.ruegnerlukas.strategygame.backend.shared.Logging
import io.ktor.websocket.DefaultWebSocketSession
import java.util.Collections

class ConnectionHandler : Logging {

	private val connections = Collections.synchronizedSet<Connection?>(LinkedHashSet())


	fun openSession(session: DefaultWebSocketSession): Int {
		val connection = Connection(session)
		connections.add(connection)
		log().info("Added new connection with id ${connection.id}")
		return connection.id
	}


	fun closeSession(connectionId: Int) {
		val removed = connections.removeIf { it.id == connectionId }
		if (removed) {
			log().info("Remove connection with id $connectionId")
		}
	}

	fun getAllConnections(): Set<Connection> {
		return connections
	}

}



