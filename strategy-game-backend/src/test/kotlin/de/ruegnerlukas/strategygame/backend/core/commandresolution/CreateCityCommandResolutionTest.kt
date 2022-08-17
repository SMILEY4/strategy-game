package de.ruegnerlukas.strategygame.backend.core.commandresolution

import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CreateCityCommandDataEntity
import de.ruegnerlukas.strategygame.backend.testutils.coreTest
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
			expectProvinces(gameId, listOf(countryId))
			expectCountryMoney(countryId, 150f)
		}
	}

	"create city in new province" {
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
			expectProvinces(gameId, listOf(countryId, countryId))
			expectCountryMoney(countryId, 110f)
		}
	}

	"create city in existing province" {
		coreTestWithGame(WorldSettings.landOnly()) { gameId ->
			val countryId = joinGame("user", gameId)
			resolveCommands(
				gameId, listOf(
					cmdCreateCity(countryId, 0, 0)
				)
			)
			endTurn(gameId)
			val provinceId = getAnyProvince(gameId).getKeyOrThrow()
			resolveCommands(
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
		coreTestWithGame(WorldSettings.waterOnly()) { gameId ->
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
		coreTestWithGame(WorldSettings.landOnly()) { gameId ->
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
					"not enough money"
				)
			)
			expectCities(gameId, listOf(4 to 2))
			expectProvinces(gameId, listOf(countryId))
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
					"tile already occupied"
				)
			)
			expectCities(gameId, listOf(4 to 2))
			expectProvinces(gameId, listOf(countryId))
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
		coreTestWithGame(WorldSettings.landOnly()) { gameId ->
			val countryId = joinGame("user", gameId)
			resolveCommands(
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

	}

}