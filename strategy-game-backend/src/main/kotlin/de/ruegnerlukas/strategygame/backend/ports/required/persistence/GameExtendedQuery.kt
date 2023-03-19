package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity

interface GameExtendedQuery {
	suspend fun execute(gameId: String): Either<EntityNotFoundError, GameExtendedEntity>
}