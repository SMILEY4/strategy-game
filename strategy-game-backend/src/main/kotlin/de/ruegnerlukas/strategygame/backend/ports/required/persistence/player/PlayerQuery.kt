package de.ruegnerlukas.strategygame.backend.ports.required.persistence.player

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity

interface PlayerQuery {

	/**
	 * Find the given player by the id
	 */
	suspend fun execute(id: String): Either<DatabaseError, PlayerEntity>

}