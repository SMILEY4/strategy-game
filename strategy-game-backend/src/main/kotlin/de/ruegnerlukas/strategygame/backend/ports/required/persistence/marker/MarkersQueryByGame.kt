package de.ruegnerlukas.strategygame.backend.ports.required.persistence.marker

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerEntity

interface MarkersQueryByGame {

	/**
	 * Find markers for the given game
	 */
	suspend fun execute(gameId: String): Either<DatabaseError, List<MarkerEntity>>

}