package de.ruegnerlukas.strategygame.backend.ports.required.persistence.country

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError

interface CountryInsert {

	/**
	 * Insert the given player-country
	 */
	suspend fun execute(country: CountryEntity): Either<DatabaseError, Unit>

}
