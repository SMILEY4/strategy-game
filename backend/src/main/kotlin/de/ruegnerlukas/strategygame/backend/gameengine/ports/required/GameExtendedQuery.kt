package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError

interface GameExtendedQuery {
	suspend fun execute(gameId: String): Either<EntityNotFoundError, GameExtended>
}