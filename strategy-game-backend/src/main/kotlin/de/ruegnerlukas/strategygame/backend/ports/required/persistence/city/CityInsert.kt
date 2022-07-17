package de.ruegnerlukas.strategygame.backend.ports.required.persistence.city

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError

interface CityInsert {

	/**
	 * Insert the given city
	 */
	suspend fun execute(city: CityEntity): Either<DatabaseError, Unit>

}