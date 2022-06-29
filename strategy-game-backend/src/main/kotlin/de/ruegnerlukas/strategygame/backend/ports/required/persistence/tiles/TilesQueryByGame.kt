package de.ruegnerlukas.strategygame.backend.ports.required.persistence.tiles

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface TilesQueryByGame {

	/**
	 * Find all tiles of the given game
	 */
	suspend fun execute(gameId: String): Either<List<TileEntity>, ApplicationError>


}