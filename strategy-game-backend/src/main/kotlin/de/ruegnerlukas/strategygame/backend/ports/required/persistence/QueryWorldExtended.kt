package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.WorldExtendedEntity

interface QueryWorldExtended {
	suspend fun execute(worldId: String): Either<EntityNotFoundError, WorldExtendedEntity>
}