package de.ruegnerlukas.strategygame.backend.core.ports.required

interface MessageProducer {

	suspend fun sendToAll(type: String, payload: String)

	suspend fun sendToSingle(connectionId: Int, type: String, payload: String)

	suspend fun sendToExcept(excludedConnectionId: Int, type: String, payload: String)

}