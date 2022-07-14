package de.ruegnerlukas.strategygame.backend.ports.provided.game

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError


interface GameCreateAction {

	suspend fun perform(userId: String): Either<ApplicationError, String>

}