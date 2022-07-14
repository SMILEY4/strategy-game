package de.ruegnerlukas.strategygame.backend.ports.provided.game

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError

interface GameConnectAction {

	suspend fun perform(userId: String, gameId: String, connectionId: Int): Either<ApplicationError, Unit>

}