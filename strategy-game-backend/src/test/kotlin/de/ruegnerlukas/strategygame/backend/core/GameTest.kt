package de.ruegnerlukas.strategygame.backend.core

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.models.world.WorldSettings
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameJoinAction
import de.ruegnerlukas.strategygame.backend.ports.provided.game.GameRequestConnectionAction
import de.ruegnerlukas.strategygame.backend.testutils.TestActions
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils
import de.ruegnerlukas.strategygame.backend.testutils.TestUtilsFactory
import de.ruegnerlukas.strategygame.backend.testutils.shouldBeError
import de.ruegnerlukas.strategygame.backend.testutils.shouldBeOk
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe

class GameTest : StringSpec({

	"create and join a new game, expect success and new game with one player" {
		val database = TestUtilsFactory.createTestDatabase()
		val createGame = TestActions.gameCreateAction(database)
		val joinGame = TestActions.gameJoinAction(database)

		val userId = "test-user"

		// create new game -> expect valid game exists
		val gameId = createGame.perform(WorldSettings.default())
		TestUtils.getGame(database, gameId).let {
			it.key shouldBe gameId
			it.turn shouldBe 0
		}

		// join game, expect one valid player for game
		joinGame.perform(userId, gameId)
		TestUtils.getPlayers(database, gameId).let { players ->
			players shouldHaveSize 1
			players[0].let { player ->
				player.userId shouldBe userId
				player.connectionId shouldBe null
				player.state shouldBe PlayerEntity.STATE_PLAYING
			}
		}

	}

	"joining a game, expect success and game with two players" {
		val database = TestUtilsFactory.createTestDatabase()
		val createGame = TestActions.gameCreateAction(database)
		val joinGame = TestActions.gameJoinAction(database)

		val userId1 = "test-user-1"
		val userId2 = "test-user-2"

		// user1: create and join new game
		val gameId = createGame.perform(WorldSettings.default())
		joinGame.perform(userId1, gameId)

		// user2: join game -> expect success and two valid players
		val result = joinGame.perform(userId2, gameId)
		result shouldBeOk true
		TestUtils.getPlayers(database, gameId).let {
			it shouldHaveSize 2
			it.find { p -> p.userId == userId1 }!!.let { p ->
				p.userId shouldBe userId1
				p.connectionId shouldBe null
				p.state shouldBe PlayerEntity.STATE_PLAYING
			}
			it.find { p -> p.userId == userId2 }!!.let { p ->
				p.userId shouldBe userId2
				p.connectionId shouldBe null
				p.state shouldBe PlayerEntity.STATE_PLAYING
			}
		}

	}

	"join a game as a player in that game already, expect success and no change" {
		val database = TestUtilsFactory.createTestDatabase()
		val createGame = TestActions.gameCreateAction(database)
		val joinGame = TestActions.gameJoinAction(database)

		val userId1 = "test-user-1"
		val userId2 = "test-user-2"

		// create and both users join game -> expect two players
		val gameId = createGame.perform(WorldSettings.default())
		joinGame.perform(userId1, gameId)
		joinGame.perform(userId2, gameId)
		val prevPlayerIds = TestUtils.getPlayers(database, gameId).map { it.userId }
		prevPlayerIds shouldHaveSize 2

		// user2 joins same game again -> expect correct error and still two valid players
		val result = joinGame.perform(userId2, gameId)
		result shouldBeError true
		(result as Either.Left).value shouldBe GameJoinAction.UserAlreadyPlayerError
		TestUtils.getPlayers(database, gameId).let {
			it shouldHaveSize 2
			it.map { p -> p.userId } shouldContainExactlyInAnyOrder prevPlayerIds
			it.find { p -> p.userId == userId1 }!!.let { p ->
				p.userId shouldBe userId1
				p.connectionId shouldBe null
				p.state shouldBe PlayerEntity.STATE_PLAYING
			}
			it.find { p -> p.userId == userId2 }!!.let { p ->
				p.userId shouldBe userId2
				p.connectionId shouldBe null
				p.state shouldBe PlayerEntity.STATE_PLAYING
			}
		}

	}

	"join a game that does not exist, expect 'GameNotFoundError'" {
		val database = TestUtilsFactory.createTestDatabase()
		val joinGame = TestActions.gameJoinAction(database)
		val result = joinGame.perform("test-user", "no-game")
		result shouldBeError GameJoinAction.GameNotFoundError
	}

	"list games of a user that is not a player in any game, expect success and empty list" {
		val database = TestUtilsFactory.createTestDatabase()
		val listGames = TestActions.gamesListAction(database)
		val result = listGames.perform("test-user")
		result shouldHaveSize 0
	}

	"list games of a user that is player, expect success and list of game-ids" {
		val database = TestUtilsFactory.createTestDatabase()
		val createGame = TestActions.gameCreateAction(database)
		val joinGame = TestActions.gameJoinAction(database)
		val listGames = TestActions.gamesListAction(database)

		val userId1 = "test-user-1"
		val userId2 = "test-user-2"
		val userId3 = "test-user-3"
		// create and join 3 seperate games
		val gameId1 = createGame.perform(WorldSettings.default())
		joinGame.perform(userId1, gameId1)
		val gameId2 = createGame.perform(WorldSettings.default())
		joinGame.perform(userId2, gameId2)
		val gameId3 = createGame.perform(WorldSettings.default())
		joinGame.perform(userId3, gameId3)
		// user1 joins other two games
		joinGame.perform(userId1, gameId2)
		joinGame.perform(userId1, gameId3)
		// expect user1 to be in the three games
		val result = listGames.perform(userId1)
		result shouldHaveSize 3
		result shouldContainExactlyInAnyOrder listOf(gameId1, gameId2, gameId3)
	}

	"request to connect to a game as a player, expect success" {
		val database = TestUtilsFactory.createTestDatabase()
		val createGame = TestActions.gameCreateAction(database)
		val joinGame = TestActions.gameJoinAction(database)
		val requestConnect = TestActions.gameRequestConnectionAction(database)
		// create and join new game
		val userId = "test-user"
		val gameId = createGame.perform(WorldSettings.default())
		joinGame.perform(userId, gameId)
		// request to connect to game -> expect success
		val result = requestConnect.perform(userId, gameId)
		result shouldBeOk true
	}

	"request to connect to a game without being a player, expect 'NotParticipantError'" {
		val database = TestUtilsFactory.createTestDatabase()
		val createGame = TestActions.gameCreateAction(database)
		val joinGame = TestActions.gameJoinAction(database)
		val requestConnect = TestActions.gameRequestConnectionAction(database)
		// user1: create and join new game
		val gameId = createGame.perform(WorldSettings.default())
		joinGame.perform("test-user-1", gameId)
		// user2: request to connect to game -> expect correct error
		val result = requestConnect.perform("test-user-2", gameId)
		result shouldBeError GameRequestConnectionAction.NotParticipantError
	}

	"request to connect to an already connected game, expect 'AlreadyConnectedError'" {
		val database = TestUtilsFactory.createTestDatabase()
		val createGame = TestActions.gameCreateAction(database)
		val joinGame = TestActions.gameJoinAction(database)
		val requestConnect = TestActions.gameRequestConnectionAction(database)
		val connect = TestActions.gameConnectAction(database)

		// create and join new game
		val userId = "test-user"
		val gameId = createGame.perform(WorldSettings.default())
		joinGame.perform(userId, gameId)

		// connect to game
		connect.perform(userId, gameId, 42) shouldBeOk true

		// request to connect to game -> expect correct error
		val result = requestConnect.perform(userId, gameId)
		result shouldBeError GameRequestConnectionAction.AlreadyConnectedError
	}

	"request to connect to a game that does not exist, expect 'GameNotFoundError'" {
		val database = TestUtilsFactory.createTestDatabase()
		val requestConnect = TestActions.gameRequestConnectionAction(database)
		// request to connect to game that does not exist -> expect correct error
		val result = requestConnect.perform("test-user", "no-game")
		result shouldBeError GameRequestConnectionAction.GameNotFoundError
	}

})