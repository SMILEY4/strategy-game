package de.ruegnerlukas.strategygame.backend.core.commandresolution

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlaceMarkerCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.provided.commands.ResolveCommandsAction
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

class PlaceMarkerCommandResolutionTest : StringSpec({

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

	"place marker outside of map, expect correct error" {
		test {
			val gameId = createGameOnlyLand()
			val countryId = joinGame("user", gameId)
			resolveCommands_expectTileNotFoundError(
				gameId,
				listOf(
					cmdPlaceMarker(countryId, 9999, 9999),
				)
			)
			expectMarkers(gameId, listOf())
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

		internal suspend fun test(block: suspend Context.() -> Unit) {
			val database = TestUtilsFactory.createTestDatabase()
			Context(
				database = database,
				createAction = TestActions.gameCreateAction(database),
				joinAction = TestActions.gameJoinAction(database),
				resolveAction = TestActions.resolveCommandsAction(database),
			).apply { block() }
		}

		internal class Context(
			private val database: ArangoDatabase,
			private val createAction: GameCreateAction,
			private val joinAction: GameJoinAction,
			private val resolveAction: ResolveCommandsAction,
		) {

			suspend fun createGameOnlyLand(): String {
				return createAction.perform(WorldSettings(seed = 42, singleTileType = TileType.LAND))
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

			suspend fun resolveCommands_expectTileNotFoundError(gameId: String, commands: List<CommandEntity<*>>) {
				val result = TestUtils.withGameExtended(database, gameId) {
					resolveAction.perform(it, commands)
				}
				result shouldBeError ResolveCommandsAction.TileNotFoundError
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