package de.ruegnerlukas.strategygame.backend.ports.required.persistence.marker

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerEntity
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface MarkersQueryByGame {

	/**
	 * Find markers for the given game
	 */
	suspend fun execute(gameId: String): Either<List<MarkerEntity>, ApplicationError>

}