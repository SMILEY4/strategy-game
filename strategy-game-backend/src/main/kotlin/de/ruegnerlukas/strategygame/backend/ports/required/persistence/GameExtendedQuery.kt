package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

interface GameExtendedQuery {
	suspend fun execute(gameId: String): Either<EntityNotFoundError, GameExtended>
}