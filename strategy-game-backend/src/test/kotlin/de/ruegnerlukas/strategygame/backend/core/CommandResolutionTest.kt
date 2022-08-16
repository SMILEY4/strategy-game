package de.ruegnerlukas.strategygame.backend.core

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.CommandResolutionError
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CreateCityCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlaceMarkerCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameCreateAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnEndAction
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase
import de.ruegnerlukas.strategygame.backend.testutils.TestActions
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils
import de.ruegnerlukas.strategygame.backend.testutils.TestUtilsFactory
import de.ruegnerlukas.strategygame.backend.testutils.shouldBeOk
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe

class CommandResolutionTest : StringSpec({

	"place marker" {
		test {
			val gameId = createGameOnlyLand()
			val countryId = joinGame("user", gameId)
			resolveCommands_expectOkNoErrors(
				gameId, listOf(
					cmdPlaceMarker(countryId, 4, 2)
				)
			)
			expectMarkers(gameId, listOf(4 to 2))
		}
	}

	"place multiple markers on same tile, reject all but the first one" {
		test {
			val gameId = createGameOnlyLand()
			val countryId = joinGame("user", gameId)
			resolveCommands_expectOkWithErrors(
				gameId,
				listOf(
					cmdPlaceMarker(countryId, 4, 2),
					cmdPlaceMarker(countryId, 4, 2)
				),
				listOf(
					"already another marker at position"
				)
			)
			expectMarkers(gameId, listOf(4 to 2))
		}
	}

	"create city" {
		test {
			val gameId = createGameOnlyLand()
			val countryId = joinGame("user", gameId)
			resolveCommands_expectOkNoErrors(
				gameId, listOf(
					cmdCreateCity(countryId, 4, 2)
				)
			)
			expectCities(gameId, listOf(4 to 2))
		}
	}

	"create city on water, reject" {
		test {
			val gameId = createGameOnlyWater()
			val countryId = joinGame("user", gameId)
			resolveCommands_expectOkWithErrors(
				gameId,
				listOf(
					cmdCreateCity(countryId, 4, 2)
				),
				listOf(
					"invalid tile type"
				)
			)
			expectCities(gameId, emptyList())
		}
	}

	"create city without enough resources, reject" {
		test {
			val gameId = createGameOnlyLand()
			val countryId = joinGame("user", gameId)
			setCountryMoney(countryId, 10f)
			resolveCommands_expectOkWithErrors(
				gameId,
				listOf(
					cmdCreateCity(countryId, 4, 2)
				),
				listOf(
					"not enough money"
				)
			)
			expectCities(gameId, emptyList())
		}
	}

	"create city on already occupied tile, reject" {
		test {
			val gameId = createGameOnlyLand()
			val countryId = joinGame("user", gameId)
			resolveCommands_expectOkNoErrors(
				gameId, listOf(
					cmdCreateCity(countryId, 4, 2)
				)
			)
			resolveCommands_expectOkWithErrors(
				gameId,
				listOf(
					cmdCreateCity(countryId, 4, 2)
				),
				listOf(
					"tile already occupied"
				)
			)
			expectCities(gameId, listOf(4 to 2))
		}
	}

	"create city on foreign tile, reject" {
		test {
			val gameId = createGameOnlyLand()
			val countryId1 = joinGame("user-1", gameId)
			val countryId2 = joinGame("user-2", gameId)
			resolveCommands_expectOkNoErrors(
				gameId, listOf(
					cmdCreateCity(countryId1, 4, 2)
				)
			)
			endTurn(gameId)
			resolveCommands_expectOkWithErrors(
				gameId,
				listOf(
					cmdCreateCity(countryId2, 4, 3)
				),
				listOf(
					"tile is part of another country",
					"not enough influence over tile"
				)
			)
			expectCities(gameId, listOf(4 to 2))
		}
	}

}) {

	companion object {

		internal fun cmdPlaceMarker(countryId: String, q: Int, r: Int) = CommandEntity(
			countryId = countryId,
			turn = 0,
			data = PlaceMarkerCommandDataEntity(
				q = q,
				r = r
			)
		)

		internal fun cmdCreateCity(countryId: String, q: Int, r: Int) = CommandEntity(
			countryId = countryId,
			turn = 0,
			data = CreateCityCommandDataEntity(
				q = q,
				r = r,
				name = "Test City",
				provinceId = null
			),
		)

		internal suspend fun test(block: suspend Context.() -> Unit) {
			val database = TestUtilsFactory.createTestDatabase()
			Context(
				database = database,
				createAction = TestActions.gameCreateAction(database),
				joinAction = TestActions.gameJoinAction(database),
				resolveAction = TestActions.resolveCommandsAction(database),
				endTurnAction = TestActions.turnEndAction(database)
			).apply { block() }
		}

		internal class Context(
			private val database: ArangoDatabase,
			private val createAction: GameCreateAction,
			private val joinAction: GameJoinAction,
			private val resolveAction: ResolveCommandsAction,
			private val endTurnAction: TurnEndAction
		) {

			private var connectionIdCounter: Int = 1

			suspend fun createGameOnlyLand(): String {
				return createAction.perform(WorldSettings(seed = 42, singleTileType = TileType.LAND))
			}

			suspend fun createGameOnlyWater(): String {
				return createAction.perform(WorldSettings(seed = 42, singleTileType = TileType.WATER))
			}

			suspend fun joinGame(userId: String, gameId: String): String {
				joinAction.perform(userId, gameId)
				return TestUtils.getCountry(database, gameId, userId).key!!
			}

			suspend fun resolveCommands_expectOkNoErrors(gameId: String, commands: List<CommandEntity<*>>) {
				val result = TestUtils.withGameExtended(database, gameId) {
					resolveAction.perform(it, commands)
				}
				result shouldBeOk true
				(result as Either.Right).value shouldHaveSize 0
			}

			suspend fun resolveCommands_expectOkWithErrors(gameId: String, commands: List<CommandEntity<*>>, expectedErrors: List<String>) {
				val result = TestUtils.withGameExtended(database, gameId) {
					resolveAction.perform(it, commands)
				}
				result shouldBeOk true
				(result as Either.Right).value.let { errors ->
					errors shouldHaveSize expectedErrors.size
					errors.map { it.errorMessage } shouldContainExactlyInAnyOrder expectedErrors
				}
			}

			suspend fun setCountryMoney(countryId: String, amount: Float) {
				val country = TestUtils.getCountry(database, countryId)
				country.resources.money = amount
				TestUtils.updateCountry(database, country)
			}

			suspend fun endTurn(gameId: String) {
				endTurnAction.perform(gameId)
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