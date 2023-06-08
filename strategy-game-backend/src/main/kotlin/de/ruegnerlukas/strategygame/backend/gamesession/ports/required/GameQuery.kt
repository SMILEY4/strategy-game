package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.models.Game
import de.ruegnerlukas.strategygame.backend.ports.models.Game
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError

interface GameQuery {
	suspend fun execute(gameId: String): Either<EntityNotFoundError, Game>
}