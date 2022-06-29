package de.ruegnerlukas.strategygame.backend.ports.required.persistence.tiles

import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.shared.either.Either

interface TileInsertMultiple {

	/**
	 * Insert the given tiles
	 */
	suspend fun execute(tiles: List<TileEntity>): Either<Unit, ApplicationError>

}