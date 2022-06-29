package de.ruegnerlukas.strategygame.backend.ports.required.persistence.tiles

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface TileQueryByGameAndPosition {

	/**
	 * Find the tile of the given game at the given position
	 */
	suspend fun execute(gameId: String, q: Int, r: Int): Either<TileEntity, ApplicationError>


}