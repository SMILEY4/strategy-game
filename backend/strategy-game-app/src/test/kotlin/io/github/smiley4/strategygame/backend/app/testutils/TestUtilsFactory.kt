package io.github.smiley4.strategygame.backend.app.testutils

import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import io.github.smiley4.strategygame.backend.common.utils.Json
import io.github.smiley4.strategygame.backend.worlds.external.message.models.Message
import io.github.smiley4.strategygame.backend.worlds.external.message.websocket.MessageProducer


object TestUtilsFactory {

	var arangoDbDockerPort = 8529

	suspend fun createTestDatabase(): ArangoDatabase {
		ArangoDatabase.delete("localhost", arangoDbDockerPort, null, null, "test-database")
		return ArangoDatabase.create("localhost", arangoDbDockerPort, null, null, "test-database")
	}

	class MockMessageProducer : MessageProducer {

		private val messages = mutableListOf<Triple<String, String, String>>() // <target, type, payload>

		fun pullMessages(): List<Triple<String, String, String>> {
			val list = mutableListOf<Triple<String, String, String>>()
			list.addAll(messages)
			messages.clear()
			return list
		}

		fun pullMessagesWithoutPayload(): List<Pair<String, String>> {
			val list = mutableListOf<Pair<String, String>>()
			list.addAll(messages.map { Pair(it.first, it.second) })
			messages.clear()
			return list
		}

		override suspend fun <T> sendToAll(message: Message<T>) {
			messages.add(Triple("all", message.type, Json.asString(message.payload as Any)))
		}

		override suspend fun <T> sendToSingle(connectionId: Long, message: Message<T>) {
			messages.add(Triple(connectionId.toString(), message.type, Json.asString(message.payload as Any)))
		}

		override suspend fun <T> sendToMultiple(connectionIds: Collection<Long>, message: Message<T>) {
			connectionIds.forEach {
				messages.add(Triple(it.toString(), message.type, Json.asString(message.payload as Any)))
			}
		}

		override suspend fun <T> sendToAllExcept(excludedConnectionId: Long, message: Message<T>) {
			throw UnsupportedOperationException()
		}

	}

}

