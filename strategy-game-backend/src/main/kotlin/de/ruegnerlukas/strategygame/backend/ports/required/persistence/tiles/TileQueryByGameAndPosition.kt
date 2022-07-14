package de.ruegnerlukas.strategygame.backend.ports.required.persistence.tiles

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.errors.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity

interface TileQueryByGameAndPosition {

	/**
	 * Find the tile of the given game at the given position
	 */
	suspend fun execute(gameId: String, q: Int, r: Int): Either<DatabaseError, TileEntity>


}