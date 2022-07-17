package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.WorldEntity

interface QueryWorld {
	suspend fun execute(worldId: String): Either<EntityNotFoundError, WorldEntity>
}