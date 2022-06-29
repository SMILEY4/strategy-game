package de.ruegnerlukas.strategygame.backend.ports.required.persistence.game

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface GameInsert {

	/**
	 * Insert the given game
	 */
	suspend fun execute(game: GameEntity): Either<Unit, ApplicationError>

}
