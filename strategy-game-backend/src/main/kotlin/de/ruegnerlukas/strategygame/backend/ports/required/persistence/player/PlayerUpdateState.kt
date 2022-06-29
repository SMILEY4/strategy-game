package de.ruegnerlukas.strategygame.backend.ports.required.persistence.player

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface PlayerUpdateState {

	/**
	 * Update the state of the player with the given id
	 */
	suspend fun execute(id: String, state: String): Either<Unit, ApplicationError>

}
