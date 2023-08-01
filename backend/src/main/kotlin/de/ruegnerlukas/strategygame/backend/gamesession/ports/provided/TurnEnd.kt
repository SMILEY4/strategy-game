package de.ruegnerlukas.strategygame.backend.gamesession.ports.provided

import arrow.core.Either


interface TurnEnd {

	sealed class TurnEndError
	object GameNotFoundError : TurnEndError()

	suspend fun perform(gameId: String): Either<TurnEndError, Unit>

}