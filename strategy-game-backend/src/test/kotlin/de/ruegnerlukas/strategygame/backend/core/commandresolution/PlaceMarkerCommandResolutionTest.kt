package de.ruegnerlukas.strategygame.backend.core.commandresolution

import de.ruegnerlukas.strategygame.backend.ports.models.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlaceMarkerCommandDataEntity
import de.ruegnerlukas.strategygame.backend.testutils.coreTest
import de.ruegnerlukas.strategygame.backend.testutils.coreTestWithGame
import io.kotest.core.spec.style.StringSpec

class PlaceMarkerCommandResolutionTest : StringSpec({

	"place marker" {
		coreTestWithGame(WorldSettings.landOnly()) { gameId ->
			val countryId = joinGame("user", gameId)
			resolveCommands(
				gameId, listOf(
					cmdPlaceMarker(countryId, 4, 2)
				)
			)
			expectMarkers(gameId, listOf(4 to 2))
		}
	}

	"place multiple markers on same tile, reject all but the first one" {
		coreTestWithGame(WorldSettings.landOnly()) { gameId ->
			val countryId = joinGame("user", gameId)
			resolveCommands_expectOkWithErrors(
				gameId,
				listOf(
					cmdPlaceMarker(countryId, 4, 2),
					cmdPlaceMarker(countryId, 4, 2)
				),
				listOf(
					"MARKER.TILE_SPACE"
				)
			)
			expectMarkers(gameId, listOf(4 to 2))
		}
	}

	"place marker outside of map, expect correct error" {
		coreTestWithGame(WorldSettings.landOnly()) { gameId ->
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

	}

}