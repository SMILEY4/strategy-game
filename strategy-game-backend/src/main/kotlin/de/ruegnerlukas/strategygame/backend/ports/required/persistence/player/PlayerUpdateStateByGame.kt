package de.ruegnerlukas.strategygame.backend.ports.required.persistence.player

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError

interface PlayerUpdateStateByGame {

	/**
	 * update the state of all players of the given game
	 */
	suspend fun execute(gameId: String, state: String): Either<DatabaseError, Unit>
}
