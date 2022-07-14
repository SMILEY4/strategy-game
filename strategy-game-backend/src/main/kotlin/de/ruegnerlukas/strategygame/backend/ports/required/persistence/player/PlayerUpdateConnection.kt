package de.ruegnerlukas.strategygame.backend.ports.required.persistence.player

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.errors.DatabaseError

interface PlayerUpdateConnection {

	/**
	 * Update the connection(-id) of the player with the given id
	 */
	suspend fun execute(playerId: String, connectionId: Int?): Either<DatabaseError, Unit>

}
