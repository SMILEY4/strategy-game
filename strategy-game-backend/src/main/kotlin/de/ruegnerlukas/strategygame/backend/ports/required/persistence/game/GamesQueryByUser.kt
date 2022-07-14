package de.ruegnerlukas.strategygame.backend.ports.required.persistence.game

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.errors.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity

interface GamesQueryByUser {

	/**
	 * Find the games with the given userid as a player
	 */
	suspend fun execute(userId: String): Either<DatabaseError, List<GameEntity>>

}