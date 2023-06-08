package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDbError

interface CountryInsert {
	suspend fun execute(country: Country, gameId: String): Either<ArangoDbError, String>
}