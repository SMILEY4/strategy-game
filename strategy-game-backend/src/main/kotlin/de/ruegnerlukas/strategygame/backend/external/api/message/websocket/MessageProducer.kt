package de.ruegnerlukas.strategygame.backend.external.api.message.websocket

import de.ruegnerlukas.strategygame.backend.external.api.message.models.Message

interface MessageProducer {

	suspend fun <T> sendToAll(message: Message<T>)

	suspend fun <T> sendToSingle(connectionId: Int, message: Message<T>)

	suspend fun <T> sendToMultiple(connectionIds: Collection<Int>, message: Message<T>)

	suspend fun <T> sendToAllExcept(excludedConnectionId: Int, message: Message<T>)

}
