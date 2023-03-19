package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended

interface GameExtendedUpdate {
	suspend fun execute(game: GameExtended): Either<EntityNotFoundError, Unit>
}