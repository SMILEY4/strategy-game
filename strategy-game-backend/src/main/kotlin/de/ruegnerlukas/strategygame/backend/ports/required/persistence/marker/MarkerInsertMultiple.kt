package de.ruegnerlukas.strategygame.backend.ports.required.persistence.marker

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerEntity
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface MarkerInsertMultiple {

	/**
	 * Insert the given markers
	 */
	suspend fun execute(markers: List<MarkerEntity>): Either<Unit, ApplicationError>

}