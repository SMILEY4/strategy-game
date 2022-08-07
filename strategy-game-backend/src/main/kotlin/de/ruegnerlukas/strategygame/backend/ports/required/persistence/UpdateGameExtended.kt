package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity

interface UpdateGameExtended {
	suspend fun execute(game: GameExtendedEntity): Either<EntityNotFoundError, Unit>
}