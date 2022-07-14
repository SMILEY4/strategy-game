package de.ruegnerlukas.strategygame.backend.ports.required.persistence.player

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.errors.DatabaseError

interface PlayerUpdateState {

	/**
	 * Update the state of the player with the given id
	 */
	suspend fun execute(id: String, state: String): Either<DatabaseError, Unit>

}
