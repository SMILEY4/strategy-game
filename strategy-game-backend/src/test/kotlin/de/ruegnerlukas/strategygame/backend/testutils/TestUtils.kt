package de.ruegnerlukas.strategygame.backend.testutils

import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.api.websocket.MessageProducer
import de.ruegnerlukas.strategygame.backend.external.persistence.DatabaseProvider
import de.ruegnerlukas.strategygame.backend.shared.DbConfig
import de.ruegnerlukas.strategygame.backend.shared.SqliteDbConfig


object TestUtils {

	suspend fun createTestDatabase(memory: Boolean = true): Database {
		if (memory) {
			return DatabaseProvider.create(DbConfig("sqlite", SqliteDbConfig("jdbc:sqlite::memory:")))
		} else {
			return DatabaseProvider.create(DbConfig("sqlite", SqliteDbConfig("jdbc:sqlite:test.db")))
		}
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

		override suspend fun sendToSingle(connectionId: Int, type: String, payload: String) {
			messages.add(Triple(connectionId.toString(), type, payload))
		}

		override suspend fun sendToMultiple(connectionIds: Collection<Int>, type: String, payload: String) {
			connectionIds.forEach {
				messages.add(Triple(it.toString(), type, payload))
			}
		}

		override suspend fun sendToAll(type: String, payload: String) {
			messages.add(Triple("all", type, payload))
		}

		override suspend fun sendToAllExcept(excludedConnectionId: Int, type: String, payload: String) {
			throw UnsupportedOperationException()
		}

	}

}

