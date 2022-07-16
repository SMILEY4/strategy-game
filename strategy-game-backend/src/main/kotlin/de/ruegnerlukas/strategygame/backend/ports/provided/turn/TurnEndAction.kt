package de.ruegnerlukas.strategygame.backend.ports.provided.turn

import arrow.core.Either


interface TurnEndAction {

	sealed class TurnEndActionError
	object GameNotFoundError : TurnEndActionError()

	suspend fun perform(gameId: String): Either<TurnEndActionError, Unit>

}