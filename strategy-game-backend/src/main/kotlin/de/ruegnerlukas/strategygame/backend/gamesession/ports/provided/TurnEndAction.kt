package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided

import arrow.core.Either


interface TurnEndAction {

	sealed class TurnEndActionError
	object GameNotFoundError : TurnEndActionError()
	object CommandResolutionFailedError: TurnEndActionError()

	suspend fun perform(gameId: String): Either<TurnEndActionError, Unit>

}