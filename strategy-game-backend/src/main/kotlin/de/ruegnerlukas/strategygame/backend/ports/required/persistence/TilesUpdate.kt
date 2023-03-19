package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.Tile

interface TilesUpdate {
	suspend fun execute(tiles: List<Tile>): Either<EntityNotFoundError, Unit>
}