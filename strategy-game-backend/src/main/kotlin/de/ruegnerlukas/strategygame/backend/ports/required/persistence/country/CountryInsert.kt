package de.ruegnerlukas.strategygame.backend.ports.required.persistence.country

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface CountryInsert {

	/**
	 * Insert the given player-country
	 */
	suspend fun execute(country: CountryEntity): Either<Unit, ApplicationError>

}
