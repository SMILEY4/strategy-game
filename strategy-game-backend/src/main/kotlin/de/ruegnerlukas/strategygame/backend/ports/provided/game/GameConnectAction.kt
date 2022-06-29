package de.ruegnerlukas.strategygame.backend.ports.provided.game

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface GameConnectAction {

	suspend fun perform(userId: String, gameId: String, connectionId: Int): Either<Unit, ApplicationError>

}