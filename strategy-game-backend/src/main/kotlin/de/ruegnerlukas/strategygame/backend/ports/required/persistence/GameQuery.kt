package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity

interface GameQuery {
	suspend fun execute(gameId: String): Either<EntityNotFoundError, GameEntity>
}