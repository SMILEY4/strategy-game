package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDbError

interface CountryInsert {
	suspend fun execute(country: Country): Either<ArangoDbError, String>
}