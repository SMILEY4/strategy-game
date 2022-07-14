package de.ruegnerlukas.strategygame.backend.ports.required.persistence.player

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.errors.DatabaseError

interface PlayerUpdateConnectionByUserSetNull {

	/**
	 * update the connection-id (set to "null") of all players with the given user-id
	 */
	suspend fun execute(userId: String): Either<DatabaseError, Unit>

}
