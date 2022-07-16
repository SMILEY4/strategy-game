package de.ruegnerlukas.strategygame.backend.ports.required.persistence.player

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity

interface PlayerQueryByGame {

	/**
	 * Find the players of the given game
	 */
	suspend fun execute(gameId: String): Either<DatabaseError, List<PlayerEntity>>

}