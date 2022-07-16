package de.ruegnerlukas.strategygame.backend.ports.required.persistence.country

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError

interface CountriesQueryByGame {

	/**
	 * Find the countries by the given game id
	 */
	suspend fun execute(gameId: String): Either<DatabaseError, List<CountryEntity>>

}