package de.ruegnerlukas.strategygame.backend.gamesession.ports.required

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.models.Tile
import de.ruegnerlukas.strategygame.backend.common.persistence.EntityNotFoundError

interface TilesUpdate {
	suspend fun execute(tiles: List<Tile>, gameId: String): Either<EntityNotFoundError, Unit>
}