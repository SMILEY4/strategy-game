package de.ruegnerlukas.strategygame.backend.core.commandresolution

import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CreateCityCommandDataEntity
import de.ruegnerlukas.strategygame.backend.testutils.coreTestWithGame
import io.kotest.core.spec.style.StringSpec

class CreateCityCommandResolutionTest : StringSpec({

	"create city" {
		coreTestWithGame(WorldSettings.landOnly()) { gameId ->
			val countryId = joinGame("user", gameId)
			resolveCommands(
				gameId, listOf(
					cmdCreateCity(countryId, 4, 2)
				)
			)
			expectCities(gameId, listOf(4 to 2))
			expectCountryMoney(countryId, 150f)
		}
	}

	"create city with already existing city" {
		coreTestWithGame(WorldSettings.landOnly()) { gameId ->
			val countryId = joinGame("user", gameId)
			resolveCommands(
				gameId, listOf(
					cmdCreateCity(countryId, 0, 0)
				)
			)
			endTurn(gameId)
			resolveCommands(
				gameId,
				listOf(
					cmdCreateCity(countryId, 0, 2)
				)
			)
			expectCities(gameId, listOf(0 to 0, 0 to 2))
			expectCountryMoney(countryId, 110f)
		}
	}

	"create city on water, reject" {
		coreTestWithGame(WorldSettings.waterOnly()) { gameId ->
			val countryId = joinGame("user", gameId)
			resolveCommands_expectOkWithErrors(
				gameId,
				listOf(
					cmdCreateCity(countryId, 4, 2)
				),
				listOf(
					"CITY.TARGET_TILE_TYPE"
				)
			)
			expectCities(gameId, emptyList())
			expectCountryMoney(countryId, 200f)
		}
	}

	"create city without enough resources, reject" {
		coreTestWithGame(WorldSettings.landOnly()) { gameId ->
			val countryId = joinGame("user", gameId)
			setCountryMoney(countryId, 10f)
			resolveCommands_expectOkWithErrors(
				gameId,
				listOf(
					cmdCreateCity(countryId, 4, 2)
				),
				listOf(
					"CITY.RESOURCES"
				)
			)
			expectCities(gameId, emptyList())
			expectCountryMoney(countryId, 10f)
		}
	}

	"create multiple cities without enough resources for all, reject second" {
		coreTestWithGame(WorldSettings.landOnly()) { gameId ->
			val countryId = joinGame("user", gameId)
			setCountryMoney(countryId, 60f)
			resolveCommands_expectOkWithErrors(
				gameId,
				listOf(
					cmdCreateCity(countryId, 4, 2),
					cmdCreateCity(countryId, 5, 2)
				),
				listOf(
					"CITY.RESOURCES"
				)
			)
			expectCities(gameId, listOf(4 to 2))
			expectCountryMoney(countryId, 10f)
		}
	}

	"create city on already occupied tile, reject" {
		coreTestWithGame(WorldSettings.landOnly()) { gameId ->
			val countryId = joinGame("user", gameId)
			resolveCommands(
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
					"CITY.TILE_SPACE"
				)
			)
			expectCities(gameId, listOf(4 to 2))
			expectCountryMoney(countryId, 150f)
		}
	}

	"create city on foreign tile, reject" {
		coreTestWithGame(WorldSettings.landOnly()) { gameId ->
			val countryId1 = joinGame("user-1", gameId)
			val countryId2 = joinGame("user-2", gameId)
			resolveCommands(
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
					"CITY.TARGET_TILE_OWNER",
					"CITY.COUNTRY_INFLUENCE",
				)
			)
			expectCities(gameId, listOf(4 to 2))
			expectCountryMoney(countryId2, 200f)
		}
	}

	"create city without enough influence on tile, reject" {
		coreTestWithGame(WorldSettings.landOnly()) { gameId ->
			val countryId1 = joinGame("user-1", gameId)
			val countryId2 = joinGame("user-2", gameId)
			resolveCommands(
				gameId, listOf(
					cmdCreateCity(countryId1, 0, 0)
				)
			)
			endTurn(gameId)
			resolveCommands_expectOkWithErrors(
				gameId,
				listOf(
					cmdCreateCity(countryId2, 0, 4)
				),
				listOf(
					"CITY.COUNTRY_INFLUENCE"
				)
			)
			expectCities(gameId, listOf(0 to 0))
			expectCountryMoney(countryId2, 200f)
		}
	}

}) {

	companion object {

		internal fun cmdCreateCity(countryId: String, q: Int, r: Int) = CommandEntity(
			countryId = countryId,
			turn = 0,
			data = CreateCityCommandDataEntity(
				q = q,
				r = r,
				name = "Test City",
			),
		)

	}

}