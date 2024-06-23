package io.github.smiley4.strategygame.backend.gateway.worlds.websocket

import io.github.smiley4.strategygame.backend.gateway.worlds.models.Message


interface MessageProducer {

	suspend fun <T> sendToAll(message: Message<T>)

	suspend fun <T> sendToSingle(connectionId: Long, message: Message<T>)

	suspend fun <T> sendToMultiple(connectionIds: Collection<Long>, message: Message<T>)

	suspend fun <T> sendToAllExcept(excludedConnectionId: Long, message: Message<T>)

}
