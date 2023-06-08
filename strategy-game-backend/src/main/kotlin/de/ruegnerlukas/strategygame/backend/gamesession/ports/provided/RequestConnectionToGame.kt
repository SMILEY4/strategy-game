package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided

import arrow.core.Either

interface RequestConnectionToGame {

	sealed class GameRequestConnectionActionError
	object GameNotFoundError : GameRequestConnectionActionError()
	object NotParticipantError : GameRequestConnectionActionError()
	object AlreadyConnectedError : GameRequestConnectionActionError()

	suspend fun perform(userId: String, gameId: String): Either<GameRequestConnectionActionError, Unit>

}