package de.ruegnerlukas.strategygame.backend.ports.required.persistence.marker

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerEntity

interface MarkerInsertMultiple {

	/**
	 * Insert the given markers
	 */
	suspend fun execute(markers: List<MarkerEntity>): Either<DatabaseError, Unit>

}