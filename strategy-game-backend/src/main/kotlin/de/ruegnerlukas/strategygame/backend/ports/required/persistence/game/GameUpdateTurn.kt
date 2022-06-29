package de.ruegnerlukas.strategygame.backend.ports.required.persistence.game

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface GameUpdateTurn {

	/**
	 * Update the turn of the game with the given id
	 */
	suspend fun execute(id: String, turn: Int): Either<Unit, ApplicationError>

}
