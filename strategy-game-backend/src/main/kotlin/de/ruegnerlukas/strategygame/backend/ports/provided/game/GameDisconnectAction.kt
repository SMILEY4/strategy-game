package de.ruegnerlukas.strategygame.backend.ports.provided.game

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError


interface GameDisconnectAction {

	suspend fun perform(userId: String): Either<ApplicationError, Unit>

}