package de.ruegnerlukas.strategygame.backend.core.commandresolution

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CreateCityCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.ProvinceEntity
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
import io.kotest.matchers.floats.shouldBeWithinPercentageOf
import io.kotest.matchers.shouldBe

class CreateCityCommandResolutionTest : StringSpec({

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
			expectProvinces(gameId, listOf(countryId))
			expectCountryMoney(countryId, 150f)
		}
	}

	"create city in new province" {
		test {
			val gameId = createGameOnlyLand()
			val countryId = joinGame("user", gameId)
			resolveCommands_expectOkNoErrors(
				gameId, listOf(
					cmdCreateCity(countryId, 0, 0)
				)
			)
			endTurn(gameId)
			resolveCommands_expectOkNoErrors(
				gameId,
				listOf(
					cmdCreateCity(countryId, 0, 2)
				)
			)
			expectCities(gameId, listOf(0 to 0, 0 to 2))
			expectProvinces(gameId, listOf(countryId, countryId))
			expectCountryMoney(countryId, 110f)
		}
	}

	"create city in existing province" {
		test {
			val gameId = createGameOnlyLand()
			val countryId = joinGame("user", gameId)
			resolveCommands_expectOkNoErrors(
				gameId, listOf(
					cmdCreateCity(countryId, 0, 0)
				)
			)
			endTurn(gameId)
			val provinceId = getAnyProvince(gameId).getKeyOrThrow()
			resolveCommands_expectOkNoErrors(
				gameId,
				listOf(
					cmdCreateCity(countryId, 0, 2, provinceId)
				)
			)
			expectCities(gameId, listOf(0 to 0, 0 to 2))
			expectProvinces(gameId, listOf(countryId))
			expectCountryMoney(countryId, 110f)
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
			expectProvinces(gameId, listOf())
			expectCountryMoney(countryId, 200f)
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
			expectProvinces(gameId, listOf())
			expectCountryMoney(countryId, 10f)
		}
	}

	"create multiple cities without enough resources for all, reject second" {
		test {
			val gameId = createGameOnlyLand()
			val countryId = joinGame("user", gameId)
			setCountryMoney(countryId, 60f)
			resolveCommands_expectOkWithErrors(
				gameId,
				listOf(
					cmdCreateCity(countryId, 4, 2),
					cmdCreateCity(countryId, 5, 2)
				),
				listOf(
					"not enough money"
				)
			)
			expectCities(gameId, listOf(4 to 2))
			expectProvinces(gameId, listOf(countryId))
			expectCountryMoney(countryId, 10f)
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
			expectProvinces(gameId, listOf(countryId))
			expectCountryMoney(countryId, 150f)
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
			expectProvinces(gameId, listOf(countryId1))
			expectCountryMoney(countryId2, 200f)
		}
	}

	"create city without enough influence on tile, reject" {
		test {
			val gameId = createGameOnlyLand()
			val countryId1 = joinGame("user-1", gameId)
			val countryId2 = joinGame("user-2", gameId)
			resolveCommands_expectOkNoErrors(
				gameId, listOf(
					cmdCreateCity(countryId1, 0, 0)
				)
			)
			endTurn(gameId)
			resolveCommands_expectOkWithErrors(
				gameId,
				listOf(
					cmdCreateCity(countryId2, 0, 3)
				),
				listOf(
					"not enough influence over tile"
				)
			)
			expectCities(gameId, listOf(0 to 0))
			expectProvinces(gameId, listOf(countryId1))
			expectCountryMoney(countryId2, 200f)
		}
	}

	"create city in province without enough influence on tile, reject" {
		test {
			val gameId = createGameOnlyLand()
			val countryId = joinGame("user", gameId)
			resolveCommands_expectOkNoErrors(
				gameId, listOf(
					cmdCreateCity(countryId, 0, 0)
				)
			)
			endTurn(gameId)
			val provinceId = getAnyProvince(gameId).getKeyOrThrow()
			resolveCommands_expectOkWithErrors(
				gameId,
				listOf(
					cmdCreateCity(countryId, 0, 10, provinceId)
				),
				listOf(
					"target province has no influence over tile"
				)
			)
			expectCities(gameId, listOf(0 to 0))
			expectProvinces(gameId, listOf(countryId))
			expectCountryMoney(countryId, 160f)
		}
	}

}) {

	companion object {

		internal fun cmdCreateCity(countryId: String, q: Int, r: Int) = cmdCreateCity(countryId, q, r, null)

		internal fun cmdCreateCity(countryId: String, q: Int, r: Int, provinceId: String?) = CommandEntity(
			countryId = countryId,
			turn = 0,
			data = CreateCityCommandDataEntity(
				q = q,
				r = r,
				name = "Test City",
				provinceId = provinceId
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

			suspend fun expectProvinces(gameId: String, provinceCountries: List<String>) {
				TestUtils.getProvinces(database, gameId).let { provinces ->
					provinces shouldHaveSize provinces.size
					provinces.map { it.countryId } shouldContainExactlyInAnyOrder provinceCountries
				}
			}

			suspend fun expectCountryMoney(countryId: String, amountMoney: Float) {
				TestUtils.getCountry(database, countryId).resources.money.shouldBeWithinPercentageOf(amountMoney, 0.01)
			}

			suspend fun getAnyProvince(gameId: String): ProvinceEntity {
				return TestUtils.getProvinces(database, gameId).first()
			}

		}

	}

}