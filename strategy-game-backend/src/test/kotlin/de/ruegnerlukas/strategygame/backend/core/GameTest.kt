package de.ruegnerlukas.strategygame.backend.core

import arrow.core.getOrHandle
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameConnectActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameCreateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameJoinActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameRequestConnectionActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GamesListActionImpl
import de.ruegnerlukas.strategygame.backend.external.api.message.producer.GameMessageProducerImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.game.GameInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.game.GameQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.game.GamesQueryByUserImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.marker.MarkersQueryByGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerQueryByGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerQueryByUserAndGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerUpdateConnectionImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.tiles.TileInsertMultipleImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.tiles.TilesQueryByGameImpl
import de.ruegnerlukas.strategygame.backend.ports.errors.AlreadyConnectedError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.NotParticipantError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils
import de.ruegnerlukas.strategygame.backend.testutils.shouldBeError
import de.ruegnerlukas.strategygame.backend.testutils.shouldBeOk
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldHaveMinLength

class GameTest : StringSpec({

	"creating a new game, expect success and new game with one player" {
		val database = TestUtils.createTestDatabase()

		val createGame = GameCreateActionImpl(
			GameInsertImpl(database),
			PlayerInsertImpl(database),
			TileInsertMultipleImpl(database),
		)

		val userId = "test-user"

		val result = createGame.perform(userId)
		result shouldBeOk true

		val gameId = result.getOrHandle { throw Exception(it.toString()) }
		gameId shouldHaveMinLength 1

		val game = GameQueryImpl(database).execute(gameId)
		game shouldBeOk true
		game.getOrHandle { throw Exception(it.toString()) }.let {
			it.id shouldBe gameId
			it.turn shouldBe 0
		}

		val players = PlayerQueryByGameImpl(database).execute(gameId)
		players shouldBeOk true
		players.getOrHandle { throw Exception(it.toString()) }.let {
			it shouldHaveSize 1
			it[0].id shouldHaveMinLength 1
			it[0].userId shouldBe userId
			it[0].gameId shouldBe gameId
			it[0].connectionId shouldBe null
			it[0].state shouldBe PlayerEntity.STATE_PLAYING
		}

	}

	"joining a game, expect success and game with two players" {
		val database = TestUtils.createTestDatabase()

		val createGame = GameCreateActionImpl(
			GameInsertImpl(database),
			PlayerInsertImpl(database),
			TileInsertMultipleImpl(database),
		)

		val joinGame = GameJoinActionImpl(
			GameQueryImpl(database),
			PlayerInsertImpl(database),
			PlayerQueryByUserAndGameImpl(database)
		)

		val userId1 = "test-user-1"
		val userId2 = "test-user-2"

		val gameId = createGame.perform(userId1).getOrHandle { throw Exception(it.toString()) }

		val result = joinGame.perform(userId2, gameId)
		result shouldBeOk true

		val players = PlayerQueryByGameImpl(database).execute(gameId)
		players shouldBeOk true
		players.getOrHandle { throw Exception(it.toString()) }.let {
			it shouldHaveSize 2
			it.find { p -> p.userId == userId1 }!!.let { p ->
				p.id shouldHaveMinLength 1
				p.userId shouldBe userId1
				p.gameId shouldBe gameId
				p.connectionId shouldBe null
				p.state shouldBe PlayerEntity.STATE_PLAYING
			}
			it.find { p -> p.userId == userId2 }!!.let { p ->
				p.id shouldHaveMinLength 1
				p.userId shouldBe userId2
				p.gameId shouldBe gameId
				p.connectionId shouldBe null
				p.state shouldBe PlayerEntity.STATE_PLAYING
			}
		}

	}

	"join a game as a player in that game already, expect success and no change" {
		val database = TestUtils.createTestDatabase()

		val createGame = GameCreateActionImpl(
			GameInsertImpl(database),
			PlayerInsertImpl(database),
			TileInsertMultipleImpl(database),
		)

		val joinGame = GameJoinActionImpl(
			GameQueryImpl(database),
			PlayerInsertImpl(database),
			PlayerQueryByUserAndGameImpl(database)
		)

		val userId1 = "test-user-1"
		val userId2 = "test-user-2"

		val gameId = createGame.perform(userId1).getOrHandle { throw Exception(it.toString()) }

		joinGame.perform(userId2, gameId)
		val prevPlayerIds = PlayerQueryByGameImpl(database).execute(gameId).getOrHandle { throw Exception(it.toString()) }.map { it.id }

		val result = joinGame.perform(userId2, gameId)
		result shouldBeOk true

		val players = PlayerQueryByGameImpl(database).execute(gameId)
		players shouldBeOk true
		players.getOrHandle { throw Exception(it.toString()) }.let {
			it shouldHaveSize 2
			it.map { p -> p.id } shouldContainExactlyInAnyOrder prevPlayerIds
			it.find { p -> p.userId == userId1 }!!.let { p ->
				p.id shouldHaveMinLength 1
				p.userId shouldBe userId1
				p.gameId shouldBe gameId
				p.connectionId shouldBe null
				p.state shouldBe PlayerEntity.STATE_PLAYING
			}
			it.find { p -> p.userId == userId2 }!!.let { p ->
				p.id shouldHaveMinLength 1
				p.userId shouldBe userId2
				p.gameId shouldBe gameId
				p.connectionId shouldBe null
				p.state shouldBe PlayerEntity.STATE_PLAYING
			}
		}

	}

	"join a game that does not exist, expect 'GameNotFoundError'" {
		val database = TestUtils.createTestDatabase()

		val joinGame = GameJoinActionImpl(
			GameQueryImpl(database),
			PlayerInsertImpl(database),
			PlayerQueryByUserAndGameImpl(database)
		)

		val userId = "test-user"
		val gameId = "no-game"

		val result = joinGame.perform(userId, gameId)
		result shouldBeError GameNotFoundError
	}

	"list games of a user that is not a player in any game, expect success and empty list" {
		val database = TestUtils.createTestDatabase()

		val listGames = GamesListActionImpl(
			GamesQueryByUserImpl(database)
		)

		val userId = "test-user"

		val result = listGames.perform(userId)
		result shouldBeOk true
		result.getOrHandle { throw Exception(it.toString()) } shouldHaveSize 0
	}

	"list games of a user that is player, expect success and list of game-ids" {
		val database = TestUtils.createTestDatabase()

		val createGame = GameCreateActionImpl(
			GameInsertImpl(database),
			PlayerInsertImpl(database),
			TileInsertMultipleImpl(database),
		)

		val joinGame = GameJoinActionImpl(
			GameQueryImpl(database),
			PlayerInsertImpl(database),
			PlayerQueryByUserAndGameImpl(database)
		)

		val listGames = GamesListActionImpl(
			GamesQueryByUserImpl(database)
		)

		val userId1 = "test-user-1"
		val userId2 = "test-user-2"
		val userId3 = "test-user-3"

		val gameId1 = createGame.perform(userId1).getOrHandle { throw Exception(it.toString()) }
		val gameId2 = createGame.perform(userId2).getOrHandle { throw Exception(it.toString()) }
		val gameId3 = createGame.perform(userId3).getOrHandle { throw Exception(it.toString()) }
		joinGame.perform(userId1, gameId2)
		joinGame.perform(userId1, gameId3)

		val result = listGames.perform(userId1)
		result shouldBeOk true
		result.getOrHandle { throw Exception(it.toString()) }.let {
			it shouldHaveSize 3
			it shouldContainExactlyInAnyOrder listOf(gameId1, gameId2, gameId3)
		}
	}

	"request to connect to a game as a player, expect success" {
		val database = TestUtils.createTestDatabase()

		val createGame = GameCreateActionImpl(
			GameInsertImpl(database),
			PlayerInsertImpl(database),
			TileInsertMultipleImpl(database),
		)

		val requestConnect = GameRequestConnectionActionImpl(
			GameQueryImpl(database),
			PlayerQueryByUserAndGameImpl(database)
		)

		val userId = "test-user"
		val gameId = createGame.perform(userId).getOrHandle { throw Exception(it.toString()) }

		val result = requestConnect.perform(userId, gameId)
		result shouldBeOk true
	}

	"request to connect to a game without being a player, expect 'NotParticipantError'" {
		val database = TestUtils.createTestDatabase()

		val createGame = GameCreateActionImpl(
			GameInsertImpl(database),
			PlayerInsertImpl(database),
			TileInsertMultipleImpl(database),
		)

		val requestConnect = GameRequestConnectionActionImpl(
			GameQueryImpl(database),
			PlayerQueryByUserAndGameImpl(database)
		)

		val userId1 = "test-user-1"
		val userId2 = "test-user-2"
		val gameId = createGame.perform(userId1).getOrHandle { throw Exception(it.toString()) }

		val result = requestConnect.perform(userId2, gameId)
		result shouldBeError NotParticipantError
	}

	"request to connect to an already connected game, expect 'AlreadyConnectedError'" {
		val database = TestUtils.createTestDatabase()

		val createGame = GameCreateActionImpl(
			GameInsertImpl(database),
			PlayerInsertImpl(database),
			TileInsertMultipleImpl(database),
		)

		val requestConnect = GameRequestConnectionActionImpl(
			GameQueryImpl(database),
			PlayerQueryByUserAndGameImpl(database)
		)

		val connect = GameConnectActionImpl(
			PlayerQueryByUserAndGameImpl(database),
			PlayerUpdateConnectionImpl(database),
			TilesQueryByGameImpl(database),
			MarkersQueryByGameImpl(database),
			GameMessageProducerImpl(TestUtils.MockMessageProducer()),
		)

		val userId = "test-user"
		val connectionId = 42
		val gameId = createGame.perform(userId).getOrHandle { throw Exception(it.toString()) }
		connect.perform(userId, gameId, connectionId) shouldBeOk true

		val result = requestConnect.perform(userId, gameId)
		result shouldBeError AlreadyConnectedError
	}

	"request to connect to a game that does not exist, expect 'GameNotFoundError'" {
		val database = TestUtils.createTestDatabase()

		val requestConnect = GameRequestConnectionActionImpl(
			GameQueryImpl(database),
			PlayerQueryByUserAndGameImpl(database)
		)

		val userId = "test-user"
		val gameId = "no-game"

		val result = requestConnect.perform(userId, gameId)
		result shouldBeError GameNotFoundError
	}

})