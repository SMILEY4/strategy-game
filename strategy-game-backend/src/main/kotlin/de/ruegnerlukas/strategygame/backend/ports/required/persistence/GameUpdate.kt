package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.Game

interface GameUpdate {
	suspend fun execute(game: Game): Either<EntityNotFoundError, Unit>
}