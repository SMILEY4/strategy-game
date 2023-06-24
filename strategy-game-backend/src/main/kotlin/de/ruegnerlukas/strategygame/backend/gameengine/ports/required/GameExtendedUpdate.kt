package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError

interface GameExtendedUpdate {
	suspend fun execute(game: GameExtended): Either<EntityNotFoundError, Unit>
}