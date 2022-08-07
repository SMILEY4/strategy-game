package de.ruegnerlukas.strategygame.backend.core

import de.ruegnerlukas.strategygame.backend.external.persistence.actions.CommandsByGameQueryImpl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CreateCityCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlaceMarkerCommandDataEntity
import de.ruegnerlukas.strategygame.backend.ports.models.game.CreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.models.world.TileType
import de.ruegnerlukas.strategygame.backend.ports.models.world.WorldSettings
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
		val database = TestUtilsFactory.createTestDatabase()
		val createGame = TestActions.gameCreateAction(database)
		val joinGame = TestActions.gameJoinAction(database)
		val connectToGame = TestActions.gameConnectAction(database)
		val submitTurn = TestActions.turnSubmitAction(database)

		val userId1 = "test-user-1"
		val userId2 = "test-user-2"

		// create a new game
		val gameId = createGame.perform(WorldSettings(seed = 42, singleTileType = TileType.LAND))

		// users players join game
		joinGame.perform(userId1, gameId) shouldBeOk true
		joinGame.perform(userId2, gameId) shouldBeOk true

		// get player ids of both users
		val countryId1 = TestUtils.getCountry(database, gameId, userId1).key!!
		val countryId2 = TestUtils.getCountry(database, gameId, userId2).key!!

		// both users connect to game
		connectToGame.perform(userId1, gameId, 1) shouldBeOk true
		connectToGame.perform(userId2, gameId, 2) shouldBeOk true

		// one user submits commands -> expect game still on turn 0 and two saved commands
		val resultSubmit1 = submitTurn.perform(userId1, gameId, listOf(PlaceMarkerCommand(q = 4, r = 2), CreateCityCommand(q = 4, r = 3)))
		resultSubmit1 shouldBeOk true
		TestUtils.getGame(database, gameId).turn shouldBe 0
		TestUtils.getCommands(database, gameId, 0).let { commands ->
			commands shouldHaveSize 2
			commands.map { it.countryId } shouldContainExactlyInAnyOrder listOf(countryId1, countryId1)
			commands.map { it.data.type } shouldContainExactlyInAnyOrder listOf(
				PlaceMarkerCommandDataEntity.TYPE,
				CreateCityCommandDataEntity.TYPE
			)
		}

		// other/last player submits commands -> expect game on next turn and three saved commands for last turn
		val resultSubmit2 = submitTurn.perform(userId2, gameId, listOf(PlaceMarkerCommand(q = 0, r = 0)))
		resultSubmit2 shouldBeOk true
		TestUtils.getGame(database, gameId).turn shouldBe 1
		CommandsByGameQueryImpl(database).execute(gameId, 0).let { commands ->
			commands shouldHaveSize 3
			commands.map { it.countryId } shouldContainExactlyInAnyOrder listOf(countryId1, countryId1, countryId2)
			commands.map { it.data.type } shouldContainExactlyInAnyOrder listOf(
				PlaceMarkerCommandDataEntity.TYPE,
				PlaceMarkerCommandDataEntity.TYPE,
				CreateCityCommandDataEntity.TYPE
			)
		}

		// assert that commands have correctly resolved and saved
		TestUtils.getMarkers(database, gameId) shouldHaveSize 2
		TestUtils.getMarkersAt(database, gameId, 4, 2) shouldHaveSize 1
		TestUtils.getMarkersAt(database, gameId, 0, 0) shouldHaveSize 1
		TestUtils.getCities(database, gameId) shouldHaveSize 1
	}

})