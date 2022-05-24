package de.ruegnerlukas.strategygame.backend.testutils

import de.ruegnerlukas.strategygame.backend.core.actions.gamelobby.GameLobbyConnectActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.gamelobby.GameLobbyCreateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.gamelobby.GameLobbyJoinActionImpl
import de.ruegnerlukas.strategygame.backend.external.api.websocket.GameMessageProducerImpl
import de.ruegnerlukas.strategygame.backend.external.api.websocket.MessageProducer
import de.ruegnerlukas.strategygame.backend.ports.required.GameRepository
import de.ruegnerlukas.strategygame.backend.shared.getOrThrow


object TestUtils {

	suspend fun setupNewGame(
		userIds: List<String>,
		connectAllPlayers: Boolean,
		repository: GameRepository,
		messageProducer: MessageProducer
	): String {
		val createGameLobby = GameLobbyCreateActionImpl(repository)
		val joinGameLobby = GameLobbyJoinActionImpl(repository)

		val gameId = createGameLobby.perform(userIds[0]).getOrThrow()
		userIds.subList(1, userIds.size).forEach { joinGameLobby.perform(it, gameId) }

		if (connectAllPlayers) {
			val connectGameLobby = GameLobbyConnectActionImpl(repository, GameMessageProducerImpl(messageProducer))
			userIds.forEachIndexed { index, userID ->
				connectGameLobby.perform(userID, index, gameId)
			}
		}

		return gameId
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

