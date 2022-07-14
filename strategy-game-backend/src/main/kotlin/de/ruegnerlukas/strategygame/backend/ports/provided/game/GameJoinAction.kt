package de.ruegnerlukas.strategygame.backend.ports.provided.game

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError


interface GameJoinAction {

	suspend fun perform(userId: String, gameId: String): Either<ApplicationError, Unit>

}