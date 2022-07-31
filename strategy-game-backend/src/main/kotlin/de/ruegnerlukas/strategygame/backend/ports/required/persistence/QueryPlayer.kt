package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity

interface QueryPlayer {
	suspend fun execute(userId: String, gameId: String): Either<EntityNotFoundError, PlayerEntity>
}