package de.ruegnerlukas.strategygame.backend.ports.provided.game

import arrow.core.Either

interface GameRequestConnectionAction {

	sealed class GameRequestConnectionActionError
	object GameNotFoundError : GameRequestConnectionActionError()
	object NotParticipantError : GameRequestConnectionActionError()
	object AlreadyConnectedError : GameRequestConnectionActionError()

	suspend fun perform(userId: String, gameId: String): Either<GameRequestConnectionActionError, Unit>

}