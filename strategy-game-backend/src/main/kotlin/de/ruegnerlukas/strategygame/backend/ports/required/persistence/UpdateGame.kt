package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity

interface UpdateGame {
	suspend fun execute(game: GameEntity): Either<EntityNotFoundError, Unit>
}