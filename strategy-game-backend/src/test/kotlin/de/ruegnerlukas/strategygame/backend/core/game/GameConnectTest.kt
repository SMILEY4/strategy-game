package de.ruegnerlukas.strategygame.backend.core.game

import de.ruegnerlukas.strategygame.backend.core.actions.game.GameConnectActionImpl
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.testutils.TestActions
import de.ruegnerlukas.strategygame.backend.testutils.TestUtilsFactory
import de.ruegnerlukas.strategygame.backend.testutils.shouldBeError
import de.ruegnerlukas.strategygame.backend.testutils.shouldBeOk
import io.kotest.core.spec.style.StringSpec

class GameConnectTest : StringSpec({

	"request to connect to a game as a player, expect success" {
		test {
			val gameId = createAndJoin("user")
			requestConnect_expectOk("user", gameId)
		}
	}

	"request to connect to a game without being a player, expect 'NotParticipantError'" {
		test {
			val gameId = createAndJoin("user-1")
			requestConnect_expectNotParticipant("user-2", gameId)
		}
	}

	"request to connect to an already connected game, expect 'AlreadyConnectedError'" {
		test {
			val gameId = createAndJoin("user")
			connect("user", gameId)
			requestConnect_expectAlreadyConnected("user", gameId)
		}
	}

	"request to connect to a game that does not exist, expect 'GameNotFoundError'" {
		test {
			requestConnect_expectGameNotFound("user", "unknown-game")
		}
	}

}) {

	companion object {

		internal suspend fun test(block: suspend Context.() -> Unit) {
			val database = TestUtilsFactory.createTestDatabase()
			Context(
				createAction = TestActions.gameCreateAction(database),
				joinAction = TestActions.gameJoinAction(database),
				requestConnectAction = TestActions.gameRequestConnectionAction(database),
				connectAction = TestActions.gameConnectAction(database)
			).apply { block() }
		}

		internal class Context(
			private val createAction: GameCreateAction,
			private val joinAction: GameJoinAction,
			private val requestConnectAction: GameRequestConnectionAction,
			private val connectAction: GameConnectActionImpl
		) {

			private var connectionIdCounter: Int = 1

			suspend fun createAndJoin(userId: String): String {
				return createAction.perform(WorldSettings.default()).also { gameId ->
					joinAction.perform(userId, gameId)
				}
			}

			suspend fun connect(userId: String, gameId: String) {
				connectAction.perform(userId, gameId, connectionIdCounter++)
			}

			suspend fun requestConnect_expectOk(userId: String, gameId: String) {
				val result = requestConnectAction.perform(userId, gameId)
				result shouldBeOk true
			}

			suspend fun requestConnect_expectNotParticipant(userId: String, gameId: String) {
				val result = requestConnectAction.perform(userId, gameId)
				result shouldBeError GameRequestConnectionAction.NotParticipantError
			}

			suspend fun requestConnect_expectAlreadyConnected(userId: String, gameId: String) {
				val result = requestConnectAction.perform(userId, gameId)
				result shouldBeError GameRequestConnectionAction.AlreadyConnectedError
			}

			suspend fun requestConnect_expectGameNotFound(userId: String, gameId: String) {
				val result = requestConnectAction.perform(userId, gameId)
				result shouldBeError GameRequestConnectionAction.GameNotFoundError
			}

		}

	}

}