package de.ruegnerlukas.strategygame.backend.ports.provided.turn

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError


interface TurnEndAction {

	suspend fun perform(gameId: String): Either<ApplicationError, Unit>

}