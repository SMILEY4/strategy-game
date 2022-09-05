package de.ruegnerlukas.strategygame.backend.ports.required.persistence

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity

interface TilesUpdate {
	suspend fun execute(tiles: List<TileEntity>): Either<EntityNotFoundError, Unit>
}