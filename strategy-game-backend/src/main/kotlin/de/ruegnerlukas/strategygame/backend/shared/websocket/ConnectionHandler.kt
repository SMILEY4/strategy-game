package de.ruegnerlukas.strategygame.backend.shared.websocket

import de.ruegnerlukas.strategygame.backend.shared.Logging
import io.ktor.websocket.DefaultWebSocketSession
import java.util.Collections

/**
 * Handler for active websocket-connections
 */
class ConnectionHandler : Logging {

	private val connections = Collections.synchronizedSet<Connection>(LinkedHashSet())


	/**
	 * Add a new connection
	 * @param session the new websocket-session
	 * @return the id associated with the connection
	 */
	fun openSession(session: DefaultWebSocketSession): Int {
		val connection = Connection(session)
		connections.add(connection)
		log().info("Added new connection with id ${connection.getId()}")
		return connection.getId()
	}


	/**
	 * Remove/Close a connection by its id
	 * @param connectionId the id of the connection to close
	 */
	fun closeSession(connectionId: Int) {
		val removed = connections.removeIf { it.getId() == connectionId }
		if (removed) {
			log().info("Remove connection with id $connectionId")
		}
	}


	/**
	 * @return all currently active connections
	 */
	fun getAllConnections(): Set<Connection> {
		return connections
	}

}



