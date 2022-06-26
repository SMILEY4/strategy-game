package de.ruegnerlukas.strategygame.backend.ports.required.persistence.player

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface PlayerUpdateConnectionByUserSetNull {

	/**
	 * update the connection-id (set to "null") of all players with the given user-id
	 */
	suspend fun execute(userId: String): Either<Unit, ApplicationError>

}
