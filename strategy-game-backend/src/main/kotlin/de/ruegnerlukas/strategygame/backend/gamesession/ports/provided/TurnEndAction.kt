package de.ruegnerlukas.strategygame.backend.gameengine.ports.provided.turn

import arrow.core.Either


interface TurnEndAction {

	sealed class TurnEndActionError
	object GameNotFoundError : TurnEndActionError()
	object CommandResolutionFailedError: TurnEndActionError()

	suspend fun perform(gameId: String): Either<TurnEndActionError, Unit>

}