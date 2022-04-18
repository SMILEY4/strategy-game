package de.ruegnerlukas.strategygame.backend.core.ports.required

/**
 * Sends messages to clients
 */
interface MessageProducer {

	/**
	 * Send a message to all currently active connections
	 * @param type the type of the message
	 * @param payload the payload of the message as a string
	 */
	suspend fun sendToAll(type: String, payload: String)


	/**
	 * Send a message to a single connections
	 * @param connectionId the id of the connection
	 * @param type the type of the message
	 * @param payload the payload of the message as a string
	 */
	suspend fun sendToSingle(connectionId: Int, type: String, payload: String)


	/**
	 * Send a message to all currently active connections except the connection with the given id
	 * @param excludedConnectionId the id of the connection not to receive the message
	 * @param type the type of the message
	 * @param payload the payload of the message as a string
	 */
	suspend fun sendToExcept(excludedConnectionId: Int, type: String, payload: String)

}