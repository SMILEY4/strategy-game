package de.ruegnerlukas.strategygame.backend.external.api.message.websocket

import de.ruegnerlukas.strategygame.backend.external.api.message.models.Message

interface MessageProducer {

	suspend fun <T> sendToAll(message: Message<T>)

	suspend fun <T> sendToSingle(connectionId: Long, message: Message<T>)

	suspend fun <T> sendToMultiple(connectionIds: Collection<Long>, message: Message<T>)

	suspend fun <T> sendToAllExcept(excludedConnectionId: Long, message: Message<T>)

}
