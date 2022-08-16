package de.ruegnerlukas.strategygame.backend.core.game

import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.testutils.TestActions
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils
import de.ruegnerlukas.strategygame.backend.testutils.TestUtilsFactory
import de.ruegnerlukas.strategygame.backend.testutils.shouldBeError
import de.ruegnerlukas.strategygame.backend.testutils.shouldBeOk
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe

class GameJoinTest : StringSpec({

	"create and join a new game, expect success and new game with one player" {
		test {
			val gameId = createGame_expectValid()
			joinGame_expectOk("user", gameId)
			expectPlayers(gameId, listOf("user"))
		}
	}

	"joining a game, expect success and game with two players" {
		test {
			val gameId = createAndJoinGame_expectOk("user-1")
			joinGame_expectOk("user-2", gameId)
			expectPlayers(gameId, listOf("user-1", "user-2"))
		}
	}

	"join a game as a player in that game already, expect no change" {
		test {
			val gameId = createGame_expectValid()
			joinGame_expectOk("user-1", gameId)
			joinGame_expectOk("user-2", gameId)
			expectPlayers(gameId, listOf("user-1", "user-2"))
			joinGame_expectAlreadyPlayer("user-2", gameId)
			expectPlayers(gameId, listOf("user-1", "user-2"))
		}
	}

	"join a game that does not exist, expect 'GameNotFoundError'" {
		test {
			joinGame_expectGameNotFound("user", "unknown-game")
		}
	}

}) {

	companion object {

		internal suspend fun test(block: suspend Context.() -> Unit) {
			val database = TestUtilsFactory.createTestDatabase()
			Context(
				database = database,
				createAction = TestActions.gameCreateAction(database),
				joinAction = TestActions.gameJoinAction(database)
			).apply { block() }
		}

		internal class Context(
			private val database: ArangoDatabase,
			private val createAction: GameCreateAction,
			private val joinAction: GameJoinAction
		) {

			suspend fun createGame_expectValid(): String {
				return createAction.perform(WorldSettings.default()).also { gameId ->
					TestUtils.getGame(database, gameId).let {
						it.key shouldBe gameId
						it.turn shouldBe 0
					}
				}
			}

			suspend fun joinGame_expectOk(userId: String, gameId: String) {
				val result = joinAction.perform(userId, gameId)
				result shouldBeOk true
			}

			suspend fun joinGame_expectAlreadyPlayer(userId: String, gameId: String) {
				val result = joinAction.perform(userId, gameId)
				result shouldBeError GameJoinAction.UserAlreadyPlayerError
			}

			suspend fun joinGame_expectGameNotFound(userId: String, gameId: String) {
				val result = joinAction.perform(userId, gameId)
				result shouldBeError GameJoinAction.GameNotFoundError
			}

			suspend fun createAndJoinGame_expectOk(userId: String): String {
				return createGame_expectValid().also { gameId ->
					joinGame_expectOk(userId, gameId)
				}
			}

			suspend fun expectPlayers(gameId: String, userIds: List<String>) {
				TestUtils.getPlayers(database, gameId).let { players ->
					players shouldHaveSize userIds.size
					players.map { it.userId } shouldContainExactlyInAnyOrder userIds
					players.forEach { player ->
						player.connectionId shouldBe null
						player.state shouldBe PlayerEntity.STATE_PLAYING
					}
				}
			}

		}

	}

}