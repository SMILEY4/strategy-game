package de.ruegnerlukas.strategygame.backend.core

import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnEndActionImpl
import de.ruegnerlukas.strategygame.backend.core.actions.turn.TurnSubmitActionImpl
import de.ruegnerlukas.strategygame.backend.external.api.message.producer.GameMessageProducerImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.old.InMemoryOldGameRepository
import de.ruegnerlukas.strategygame.backend.ports.models.gamelobby.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.models.world.MarkerTileObject
import de.ruegnerlukas.strategygame.backend.shared.either.getOrThrow
import de.ruegnerlukas.strategygame.backend.testutils.TestUtils
import de.ruegnerlukas.strategygame.backend.testutils.shouldBeOk
import io.kotest.assertions.withClue
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize

class TurnTest : StringSpec({

	"submit turns" {
		val repository = InMemoryOldGameRepository()
		val userId1 = "my-test-user-1"
		val userId2 = "my-test-user-2"
		val messageProducer = TestUtils.MockMessageProducer()
		val submitTurnAction = TurnSubmitActionImpl(repository, TurnEndActionImpl(repository, GameMessageProducerImpl(messageProducer)))

		val gameId = TestUtils.setupNewGame(listOf(userId1, userId2), true, repository, messageProducer)
		messageProducer.pullMessages()

		val resultSubmit1 = submitTurnAction.perform(
			userId1, gameId, listOf(
				PlaceMarkerCommand(userId1, 0, 0),
				PlaceMarkerCommand(userId1, 1, 0),
				PlaceMarkerCommand(userId1, 0, 1)
			)
		)

		resultSubmit1 shouldBeOk true
		withClue("game-state correct after first player submits turn") {
			val state = repository.get(gameId).getOrThrow()
			state.commands shouldContainExactlyInAnyOrder listOf(
				PlaceMarkerCommand(userId1, 0, 0),
				PlaceMarkerCommand(userId1, 1, 0),
				PlaceMarkerCommand(userId1, 0, 1)
			)
			TestUtils.collectMarkers(state.world) shouldHaveSize 0
		}

		val resultSubmit2 = submitTurnAction.perform(
			userId2, gameId, listOf(
				PlaceMarkerCommand(userId2, 4, 2),
			)
		)

		resultSubmit2 shouldBeOk true
		withClue("game-state correct after last player submits (and ends) turn") {
			val state = repository.get(gameId).getOrThrow()
			state.commands shouldHaveSize 0
			TestUtils.collectMarkers(state.world) shouldContainExactlyInAnyOrder listOf(
				MarkerTileObject(userId1),
				MarkerTileObject(userId1),
				MarkerTileObject(userId1),
				MarkerTileObject(userId2),
			)
		}
		messageProducer.pullMessagesWithoutPayload().shouldContainExactlyInAnyOrder(
			Pair("0", "world-state"),
			Pair("1", "world-state")
		)

	}

})


