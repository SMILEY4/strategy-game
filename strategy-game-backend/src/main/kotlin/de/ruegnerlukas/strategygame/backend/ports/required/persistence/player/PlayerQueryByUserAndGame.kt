package de.ruegnerlukas.strategygame.backend.ports.required.persistence.player

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.errors.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity

interface PlayerQueryByUserAndGame {

	/**
	 * Find the player by the given userid and game
	 */
	suspend fun execute(userId: String, gameId: String): Either<DatabaseError, PlayerEntity>

}