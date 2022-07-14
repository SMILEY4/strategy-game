package de.ruegnerlukas.strategygame.backend.ports.required.persistence.game

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.errors.DatabaseError

interface GameUpdateTurn {

	/**
	 * Update the turn of the game with the given id
	 */
	suspend fun execute(id: String, turn: Int): Either<DatabaseError, Unit>

}
