package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDbError

interface CountryInsert {
	suspend fun execute(country: CountryEntity): Either<ArangoDbError, String>
}