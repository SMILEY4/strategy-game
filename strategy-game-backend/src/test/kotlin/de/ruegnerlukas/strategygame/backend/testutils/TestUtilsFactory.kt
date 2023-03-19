package de.ruegnerlukas.strategygame.backend.testutils

import de.ruegnerlukas.strategygame.backend.external.api.message.models.Message
import de.ruegnerlukas.strategygame.backend.external.api.websocket.MessageProducer
import de.ruegnerlukas.strategygame.backend.shared.Json
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase
import kotlinx.coroutines.future.await


object TestUtilsFactory {

	suspend fun createTestDatabase(): ArangoDatabase {
		ArangoDatabase.delete("localhost", 8529, null, null, "test-database")
		return ArangoDatabase.create("localhost", 8529, null, null, "test-database")
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

		override suspend fun <T> sendToSingle(connectionId: Int, message: Message<T>) {
			messages.add(Triple(connectionId.toString(), message.type, Json.asString(message.payload as Any)))
		}

		override suspend fun <T> sendToMultiple(connectionIds: Collection<Int>, message: Message<T>) {
			connectionIds.forEach {
				messages.add(Triple(it.toString(), message.type, Json.asString(message.payload as Any)))
			}
		}

		override suspend fun <T> sendToAll(message: Message<T>) {
			messages.add(Triple("all", message.type, Json.asString(message.payload as Any)))
		}

		override suspend fun <T> sendToAllExcept(excludedConnectionId: Int, message: Message<T>) {
			throw UnsupportedOperationException()
		}

	}

}

