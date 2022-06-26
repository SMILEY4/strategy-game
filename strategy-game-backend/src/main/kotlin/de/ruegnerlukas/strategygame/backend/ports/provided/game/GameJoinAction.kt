package de.ruegnerlukas.strategygame.backend.ports.provided.game

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.shared.either.Either


interface GameJoinAction {

	suspend fun perform(userId: String, gameId: String): Either<Unit, ApplicationError>

}