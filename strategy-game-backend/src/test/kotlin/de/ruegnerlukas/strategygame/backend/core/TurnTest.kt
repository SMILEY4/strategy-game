package de.ruegnerlukas.strategygame.backend.core

import de.ruegnerlukas.strategygame.backend.external.persistence.actions.QueryCommandsByGameImpl
import de.ruegnerlukas.strategygame.backend.ports.models.game.CreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.testutils.TestActions
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils
import de.ruegnerlukas.strategygame.backend.testutils.TestUtilsFactory
import de.ruegnerlukas.strategygame.backend.testutils.shouldBeOk
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe

class TurnTest : StringSpec({

	"submit commands, expect save commands and ending turn" {
		val database = TestUtilsFactory.createTestDatabase()
		val createGame = TestActions.gameCreateAction(database)
		val joinGame = TestActions.gameJoinAction(database)
		val connectToGame = TestActions.gameConnectAction(database)
		val submitTurn = TestActions.turnSubmitAction(database)

		val userId1 = "test-user-1"
		val userId2 = "test-user-2"

		// create a new game
		val gameId = createGame.perform()

		// users players join game
		joinGame.perform(userId1, gameId) shouldBeOk true
		joinGame.perform(userId2, gameId) shouldBeOk true

		// get player ids of both users
		val playerId1 = TestUtils.getPlayer(database, userId1, gameId).id
		val playerId2 = TestUtils.getPlayer(database, userId2, gameId).id

		// both users connect to game
		connectToGame.perform(userId1, gameId, 1) shouldBeOk true
		connectToGame.perform(userId2, gameId, 2) shouldBeOk true

		// one user submits commands -> expect game still on turn 0 and two saved commands
		val resultSubmit1 = submitTurn.perform(userId1, gameId, listOf(PlaceMarkerCommand(q = 4, r = 2), CreateCityCommand(q = 4, r = 3)))
		resultSubmit1 shouldBeOk true
		TestUtils.getGame(database, gameId).turn shouldBe 0
		TestUtils.getCommands(database, gameId, 0).let { commands ->
			commands shouldHaveSize 2
			commands.map { it.playerId } shouldContainExactlyInAnyOrder listOf(playerId1, playerId1)
			commands.map { it.type } shouldContainExactlyInAnyOrder listOf(PlaceMarkerCommand.TYPE, CreateCityCommand.TYPE)
		}

		// other/last player submits commands -> expect game on next turn and three saved commands for last turn
		val resultSubmit2 = submitTurn.perform(userId2, gameId, listOf(PlaceMarkerCommand(q = 0, r = 0)))
		resultSubmit2 shouldBeOk true
		TestUtils.getGame(database, gameId).turn shouldBe 1
		QueryCommandsByGameImpl(database).execute(gameId, 0).let { commands ->
			commands shouldHaveSize 3
			commands.map { it.playerId } shouldContainExactlyInAnyOrder listOf(playerId1, playerId1, playerId2)
			commands.map { it.type } shouldContainExactlyInAnyOrder listOf(
				PlaceMarkerCommand.TYPE,
				PlaceMarkerCommand.TYPE,
				CreateCityCommand.TYPE
			)
		}
	}

})