package de.ruegnerlukas.strategygame.backend.core

import de.ruegnerlukas.strategygame.backend.ports.models.CreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.models.PlayerCommand
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CreateCityCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlaceMarkerCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameConnectAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnSubmitAction
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.testutils.TestActions
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils
import de.ruegnerlukas.strategygame.backend.testutils.TestUtilsFactory
import de.ruegnerlukas.strategygame.backend.testutils.shouldBeOk
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe

class TurnTest : StringSpec({

	"submit commands, expect saved commands, ending turn and resolved commands" {
		test {
			val gameId = createGameOnlyLand()
			val countryId1 = joinAndConnect("user-1", gameId)
			val countryId2 = joinAndConnect("user-2", gameId)
			submitTurn_expectOk(
				"user-1", gameId, listOf(
					PlaceMarkerCommand(q = 4, r = 2),
					CreateCityCommand(q = 4, r = 3, name = "Test", null)
				)
			)
			expectTurn(gameId, 0)
			expectCommands(
				gameId, 0, listOf(
					PlaceMarkerCommandDataEntity.TYPE to countryId1,
					CreateCityCommandDataEntity.TYPE to countryId1
				)
			)
			submitTurn_expectOk(
				"user-2", gameId, listOf(
					PlaceMarkerCommand(q = 0, r = 0)
				)
			)
			expectTurn(gameId, 1)
			expectCommands(
				gameId, 0, listOf(
					PlaceMarkerCommandDataEntity.TYPE to countryId1,
					CreateCityCommandDataEntity.TYPE to countryId1,
					PlaceMarkerCommandDataEntity.TYPE to countryId2,
				)
			)
			expectCities(gameId, listOf(4 to 3))
			expectMarkers(gameId, listOf(4 to 2, 0 to 0))
		}
	}

}) {

	companion object {

		internal suspend fun test(block: suspend Context.() -> Unit) {
			val database = TestUtilsFactory.createTestDatabase()
			Context(
				database = database,
				createAction = TestActions.gameCreateAction(database),
				joinAction = TestActions.gameJoinAction(database),
				connectAction = TestActions.gameConnectAction(database),
				submitAction = TestActions.turnSubmitAction(database)
			).apply { block() }
		}

		internal class Context(
			private val database: ArangoDatabase,
			private val createAction: GameCreateAction,
			private val joinAction: GameJoinAction,
			private val connectAction: GameConnectAction,
			private val submitAction: TurnSubmitAction
		) {

			private var connectionIdCounter: Int = 1

			suspend fun createGameOnlyLand(): String {
				return createAction.perform(WorldSettings(seed = 42, singleTileType = TileType.LAND))
			}

			suspend fun joinAndConnect(userId: String, gameId: String): String {
				joinAction.perform(userId, gameId)
				connectAction.perform(userId, gameId, connectionIdCounter++)
				return TestUtils.getCountry(database, gameId, userId).key!!
			}

			suspend fun submitTurn_expectOk(userId: String, gameId: String, commands: List<PlayerCommand>) {
				val result = submitAction.perform(userId, gameId, commands)
				result shouldBeOk true
			}

			suspend fun expectTurn(gameId: String, turn: Int) {
				TestUtils.getGame(database, gameId).turn shouldBe turn
			}

			suspend fun expectCommands(gameId: String, turn: Int, commandTypeAndCountry: List<Pair<String, String>>) {
				TestUtils.getCommands(database, gameId, turn).let { commands ->
					commands shouldHaveSize commandTypeAndCountry.size
					commands.map { it.countryId } shouldContainExactlyInAnyOrder commandTypeAndCountry.map { it.second }
					commands.map { it.data.type } shouldContainExactlyInAnyOrder commandTypeAndCountry.map { it.first }
				}
			}

			suspend fun expectCities(gameId: String, cityPositions: List<Pair<Int, Int>>) {
				TestUtils.getCities(database, gameId) shouldHaveSize cityPositions.size
				cityPositions.forEach { pos ->
					TestUtils.getCitiesAt(database, gameId, pos.first, pos.second).size shouldBe 1
				}
			}

			suspend fun expectMarkers(gameId: String, markerPositions: List<Pair<Int, Int>>) {
				TestUtils.getMarkers(database, gameId) shouldHaveSize markerPositions.size
				markerPositions.forEach { pos ->
					TestUtils.getMarkersAt(database, gameId, pos.first, pos.second).size shouldBe 1
				}
			}

		}

	}

}