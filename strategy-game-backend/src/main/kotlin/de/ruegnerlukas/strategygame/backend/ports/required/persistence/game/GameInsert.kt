package de.ruegnerlukas.strategygame.backend.ports.required.persistence.game

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity

interface GameInsert {

	/**
	 * Insert the given game
	 */
	suspend fun execute(game: GameEntity): Either<DatabaseError, Unit>

}
