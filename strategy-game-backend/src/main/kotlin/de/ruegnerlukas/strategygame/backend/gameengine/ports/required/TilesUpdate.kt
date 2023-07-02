package de.ruegnerlukas.strategygame.backend.gameengine.ports.required

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError

interface TilesUpdate {
	suspend fun execute(tiles: Collection<Tile>, gameId: String): Either<EntityNotFoundError, Unit>
}