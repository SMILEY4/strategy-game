package de.ruegnerlukas.strategygame.backend.ports.required.persistence.tiles

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.errors.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity

interface TileInsertMultiple {

	/**
	 * Insert the given tiles
	 */
	suspend fun execute(tiles: List<TileEntity>): Either<DatabaseError, Unit>

}