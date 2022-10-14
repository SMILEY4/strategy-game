package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.Country

interface CountryByGameAndUserQuery {
	suspend fun execute(gameId: String, userId: String): Either<EntityNotFoundError, Country>
}