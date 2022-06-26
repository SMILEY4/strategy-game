package de.ruegnerlukas.strategygame.backend.core

import de.ruegnerlukas.strategygame.backend.core.actions.game.GameConnectActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameCreateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameJoinActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnEndActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnSubmitActionImpl
import de.ruegnerlukas.strategygame.backend.external.api.message.producer.GameMessageProducerImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.game.GameInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.game.GameQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.game.GameUpdateTurnImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.marker.MarkerInsertMultipleImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.order.OrderInsertMultipleImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.order.OrderQueryByGameAndTurnImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerQueryByUserAndGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerUpdateConnectionImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerUpdateStateByGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerUpdateStateImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayersQueryByGameConnectedImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayersQueryByGameStatePlayingImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.tiles.TileInsertMultipleImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.tiles.TileQueryByGameAndPositionImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.tiles.TilesQueryByGameImpl
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.CommandType
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.shared.either.getOrThrow
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils
import de.ruegnerlukas.strategygame.backend.testutils.shouldBeOk
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe

class TurnTest : StringSpec({

	"submit orders, expect saved and ending turn" {
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

		val connectToGame = GameConnectActionImpl(
			PlayerQueryByUserAndGameImpl(database),
			PlayerUpdateConnectionImpl(database),
			TilesQueryByGameImpl(database),
			GameMessageProducerImpl(TestUtils.MockMessageProducer()),
		)

		val submitTurn = TurnSubmitActionImpl(
			GameQueryImpl(database),
			PlayerQueryByUserAndGameImpl(database),
			PlayersQueryByGameStatePlayingImpl(database),
			TileQueryByGameAndPositionImpl(database),
			PlayerUpdateStateImpl(database),
			OrderInsertMultipleImpl(database),
			TurnEndActionImpl(
				GameQueryImpl(database),
				OrderQueryByGameAndTurnImpl(database),
				PlayersQueryByGameConnectedImpl(database),
				TilesQueryByGameImpl(database),
				PlayerUpdateStateByGameImpl(database),
				GameUpdateTurnImpl(database),
				MarkerInsertMultipleImpl(database),
				GameMessageProducerImpl(TestUtils.MockMessageProducer()),
			),
		)

		val userId1 = "test-user-1"
		val userId2 = "test-user-2"
		val gameId = createGame.perform(userId1).getOrThrow()

		joinGame.perform(userId2, gameId) shouldBeOk true

		connectToGame.perform(userId1, gameId, 1) shouldBeOk true
		connectToGame.perform(userId1, gameId, 2) shouldBeOk true

		val player1 = PlayerQueryByUserAndGameImpl(database).execute(userId1, gameId).getOrThrow().id
		val player2 = PlayerQueryByUserAndGameImpl(database).execute(userId2, gameId).getOrThrow().id

		val resultSubmit1 = submitTurn.perform(
			userId1, gameId, listOf(
				PlaceMarkerCommand(
					userId = userId1,
					q = 4,
					r = 2,
					commandType = CommandType.PLACE_MARKER
				),
				PlaceMarkerCommand(
					userId = userId1,
					q = 4,
					r = 3,
					commandType = CommandType.PLACE_MARKER
				)
			)
		)

		resultSubmit1 shouldBeOk true
		GameQueryImpl(database).execute(gameId).getOrThrow().let { game ->
			game.turn shouldBe 0
		}
		OrderQueryByGameAndTurnImpl(database).execute(gameId, 0).getOrThrow().let { orders ->
			orders shouldHaveSize 2
			orders.map { it.playerId } shouldContainExactlyInAnyOrder listOf(player1, player1)
		}

		val resultSubmit2 = submitTurn.perform(
			userId2, gameId, listOf(
				PlaceMarkerCommand(
					userId = userId2,
					q = 0,
					r = 0,
					commandType = CommandType.PLACE_MARKER
				)
			)
		)

		resultSubmit2 shouldBeOk true
		GameQueryImpl(database).execute(gameId).getOrThrow().let {
			it.turn shouldBe 1
		}
		OrderQueryByGameAndTurnImpl(database).execute(gameId, 0).getOrThrow().let { orders ->
			orders shouldHaveSize 3
			orders.map { it.playerId } shouldContainExactlyInAnyOrder listOf(player1, player1, player2)
		}

	}

})