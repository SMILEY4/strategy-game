package de.ruegnerlukas.strategygame.backend.gamesession.ports.required

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Country
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError

interface CountryByGameAndUserQuery {
	suspend fun execute(gameId: String, userId: String): Either<EntityNotFoundError, Country>
}