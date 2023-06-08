package de.ruegnerlukas.strategygame.backend.gamesession.ports.required

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError

interface GameExtendedQuery {
	suspend fun execute(gameId: String): Either<EntityNotFoundError, GameExtended>
}