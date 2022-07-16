package de.ruegnerlukas.strategygame.backend.ports.required.persistence.tiles

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity

interface TilesQueryByGame {

	/**
	 * Find all tiles of the given game
	 */
	suspend fun execute(gameId: String): Either<DatabaseError, List<TileEntity>>


}