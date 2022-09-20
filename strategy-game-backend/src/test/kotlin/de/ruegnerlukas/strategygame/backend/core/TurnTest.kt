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
import de.ruegnerlukas.strategygame.backend.testutils.coreTest
import de.ruegnerlukas.strategygame.backend.testutils.shouldBeOk
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe

class TurnTest : StringSpec({

	"submit commands, expect saved commands, ending turn and resolved commands" {
		coreTest {
			val gameId = createGameOnlyLand()
			val countryId1 = joinAndConnect("user-1", gameId)
			val countryId2 = joinAndConnect("user-2", gameId)
			submitTurn(
				"user-1", gameId, listOf(
					PlaceMarkerCommand(q = 4, r = 2),
					CreateCityCommand(q = 4, r = 3, name = "Test")
				)
			)
			expectTurn(gameId, 0)
			expectCommands(
				gameId, 0, listOf(
					PlaceMarkerCommandDataEntity.TYPE to countryId1,
					CreateCityCommandDataEntity.TYPE to countryId1
				)
			)
			submitTurn(
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

})