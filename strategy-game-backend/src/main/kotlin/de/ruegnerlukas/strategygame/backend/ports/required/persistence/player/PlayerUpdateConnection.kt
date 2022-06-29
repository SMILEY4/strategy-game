package de.ruegnerlukas.strategygame.backend.ports.required.persistence.player

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface PlayerUpdateConnection {

	/**
	 * Update the connection(-id) of the player with the given id
	 */
	suspend fun execute(playerId: String, connectionId: Int?): Either<Unit, ApplicationError>

}
