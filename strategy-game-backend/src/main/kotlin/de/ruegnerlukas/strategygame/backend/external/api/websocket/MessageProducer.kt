package de.ruegnerlukas.strategygame.backend.external.api.websocket

interface MessageProducer {
	suspend fun sendToAll(type: String, payload: String)

	suspend fun sendToSingle(connectionId: Int, type: String, payload: String)

	suspend fun sendToMultiple(connectionIds: Collection<Int>, type: String, payload: String)

	suspend fun sendToAllExcept(excludedConnectionId: Int, type: String, payload: String)
}
