package de.ruegnerlukas.strategygame.backend.gamesession.ports.required

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.models.Game
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError

interface GameUpdate {
	suspend fun execute(game: Game): Either<EntityNotFoundError, Unit>
}