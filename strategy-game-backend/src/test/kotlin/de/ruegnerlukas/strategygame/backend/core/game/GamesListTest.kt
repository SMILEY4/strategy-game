package de.ruegnerlukas.strategygame.backend.core.game

import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GamesListAction
import de.ruegnerlukas.strategygame.backend.testutils.TestActions
import de.ruegnerlukas.strategygame.backend.testutils.TestUtilsFactory
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize

class GamesListTest : StringSpec({

	"list games of a user that is not a player in any game, expect success and empty list" {
		test {
			listGames_expect("user", listOf())
		}
	}

	"list games of a user that is player, expect success and list of game-ids" {
		test {
			val gameId1 = createAndJoinGame("user-1")
			val gameId2 = createAndJoinGame("user-2")
			val gameId3 = createAndJoinGame("user-3")
			joinGame("user-1", gameId2)
			joinGame("user-1", gameId3)
			listGames_expect("user-1", listOf(gameId1, gameId2, gameId3))
		}
	}

}) {

	companion object {

		internal suspend fun test(block: suspend Context.() -> Unit) {
			val database = TestUtilsFactory.createTestDatabase()
			Context(
				createAction = TestActions.gameCreateAction(database),
				joinAction = TestActions.gameJoinAction(database),
				listAction = TestActions.gamesListAction(database)
			).apply { block() }
		}

		internal class Context(
			private val createAction: GameCreateAction,
			private val joinAction: GameJoinAction,
			private val listAction: GamesListAction
		) {

			suspend fun joinGame(userId: String, gameId: String) {
				joinAction.perform(userId, gameId)
			}

			suspend fun createAndJoinGame(userId: String): String {
				return createAction.perform(WorldSettings.default()).also { gameId ->
					joinGame(userId, gameId)
				}
			}

			suspend fun listGames_expect(userId: String, gameIds: List<String>) {
				val result = listAction.perform(userId)
				result shouldHaveSize gameIds.size
				result shouldContainExactlyInAnyOrder gameIds
			}

		}

	}

}