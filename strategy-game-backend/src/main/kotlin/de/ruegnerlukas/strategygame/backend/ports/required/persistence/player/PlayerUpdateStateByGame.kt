package de.ruegnerlukas.strategygame.backend.ports.required.persistence.player

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface PlayerUpdateStateByGame {

	/**
	 * update the state of all players of the given game
	 */
	suspend fun execute(gameId: String, state: String): Either<Unit, ApplicationError>
}
