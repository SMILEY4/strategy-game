package de.ruegnerlukas.strategygame.backend.ports.provided.turn

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.shared.Either


interface TurnEndAction {

	suspend fun perform(gameId: String): Either<Unit, ApplicationError>

}