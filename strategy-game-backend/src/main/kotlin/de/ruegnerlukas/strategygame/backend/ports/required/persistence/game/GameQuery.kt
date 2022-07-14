package de.ruegnerlukas.strategygame.backend.ports.required.persistence.game

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.errors.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity

interface GameQuery {

	/**
	 * Find the game with the given id
	 */
	suspend fun execute(id: String): Either<DatabaseError, GameEntity>

}