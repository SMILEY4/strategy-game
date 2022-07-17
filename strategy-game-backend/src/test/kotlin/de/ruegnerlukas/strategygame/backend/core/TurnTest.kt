package de.ruegnerlukas.strategygame.backend.core

import arrow.core.getOrHandle
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameConnectActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameCreateActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.game.GameJoinActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnEndActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnSubmitActionImpl
import de.ruegnerlukas.strategygame.backend.external.api.message.producer.GameMessageProducerImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.city.CityInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.command.CommandInsertMultipleImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.command.CommandsQueryByGameAndTurnImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.country.CountriesQueryByGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.game.GameQueryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.game.GameUpdateTurnImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.gameext.CreateGameInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.marker.MarkerInsertMultipleImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.marker.MarkersQueryByGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerInsertImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerQueryByGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerQueryByUserAndGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerUpdateConnectionImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerUpdateStateByGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayerUpdateStateImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.player.PlayersQueryByGameStatePlayingImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.tiles.TileQueryByGameAndPositionImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.tiles.TilesQueryByGameImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.actions.world.WorldQueryImpl
import de.ruegnerlukas.strategygame.backend.ports.models.game.CreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlaceMarkerCommand
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
			CreateGameInsertImpl(database)
		)

		val joinGame = GameJoinActionImpl(
			GameQueryImpl(database),
			PlayerInsertImpl(database),
			PlayerQueryByUserAndGameImpl(database)
		)

		val connectToGame = GameConnectActionImpl(
			PlayerQueryByUserAndGameImpl(database),
			PlayerUpdateConnectionImpl(database),
			WorldQueryImpl(
				TilesQueryByGameImpl(database),
				MarkersQueryByGameImpl(database),
				CountriesQueryByGameImpl(database)
			),
			GameMessageProducerImpl(TestUtils.MockMessageProducer()),
		)

		val submitTurn = TurnSubmitActionImpl(
			GameQueryImpl(database),
			PlayerQueryByUserAndGameImpl(database),
			PlayersQueryByGameStatePlayingImpl(database),
			TileQueryByGameAndPositionImpl(database),
			PlayerUpdateStateImpl(database),
			CommandInsertMultipleImpl(database),
			TurnEndActionImpl(
				GameQueryImpl(database),
				CommandsQueryByGameAndTurnImpl(database),
				PlayerUpdateStateByGameImpl(database),
				GameUpdateTurnImpl(database),
				MarkerInsertMultipleImpl(database),
				CityInsertImpl(database),
				PlayerQueryByGameImpl(database),
				WorldQueryImpl(
					TilesQueryByGameImpl(database),
					MarkersQueryByGameImpl(database),
					CountriesQueryByGameImpl(database)
				),
				GameMessageProducerImpl(TestUtils.MockMessageProducer()),
			),
		)

		val userId1 = "test-user-1"
		val userId2 = "test-user-2"
		val gameId = createGame.perform()

		joinGame.perform(userId1, gameId) shouldBeOk true
		joinGame.perform(userId2, gameId) shouldBeOk true

		connectToGame.perform(userId1, gameId, 1) shouldBeOk true
		connectToGame.perform(userId1, gameId, 2) shouldBeOk true

		val player1 = PlayerQueryByUserAndGameImpl(database).execute(userId1, gameId).getOrHandle { throw Exception(it.toString()) }.id
		val player2 = PlayerQueryByUserAndGameImpl(database).execute(userId2, gameId).getOrHandle { throw Exception(it.toString()) }.id

		val resultSubmit1 = submitTurn.perform(
			userId1, gameId, listOf(
				PlaceMarkerCommand(
					q = 4,
					r = 2,
				),
				CreateCityCommand(
					q = 4,
					r = 3,
				)
			)
		)

		resultSubmit1 shouldBeOk true
		GameQueryImpl(database).execute(gameId).getOrHandle { throw Exception(it.toString()) }.let { game ->
			game.turn shouldBe 0
		}
		CommandsQueryByGameAndTurnImpl(database).execute(gameId, 0).getOrHandle { throw Exception(it.toString()) }.let { commands ->
			commands shouldHaveSize 2
			commands.map { it.playerId } shouldContainExactlyInAnyOrder listOf(player1, player1)
			commands.map { it.type } shouldContainExactlyInAnyOrder listOf(PlaceMarkerCommand.TYPE, CreateCityCommand.TYPE)
		}

		val resultSubmit2 = submitTurn.perform(
			userId2, gameId, listOf(
				PlaceMarkerCommand(
					q = 0,
					r = 0,
				)
			)
		)

		resultSubmit2 shouldBeOk true
		GameQueryImpl(database).execute(gameId).getOrHandle { throw Exception(it.toString()) }.let {
			it.turn shouldBe 1
		}
		CommandsQueryByGameAndTurnImpl(database).execute(gameId, 0).getOrHandle { throw Exception(it.toString()) }.let { commands ->
			commands shouldHaveSize 3
			commands.map { it.playerId } shouldContainExactlyInAnyOrder listOf(player1, player1, player2)
			commands.map { it.type } shouldContainExactlyInAnyOrder listOf(
				PlaceMarkerCommand.TYPE,
				PlaceMarkerCommand.TYPE,
				CreateCityCommand.TYPE
			)

		}

	}

})