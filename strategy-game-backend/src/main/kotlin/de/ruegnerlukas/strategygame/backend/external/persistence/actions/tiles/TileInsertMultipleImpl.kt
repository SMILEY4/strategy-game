package de.ruegnerlukas.strategygame.backend.external.persistence.actions.tiles

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.TileTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.GenericDatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.tiles.TileInsertMultiple
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.mapError

class TileInsertMultipleImpl(private val database: Database): TileInsertMultiple {

	override suspend fun execute(tiles: List<TileEntity>): Either<Unit, ApplicationError> {
		return Either
			.runCatching {
				database.insertBatched(50, tiles) { batch ->
					SQL
						.insert()
						.into(TileTbl)
						.columns(TileTbl.id, TileTbl.gameId, TileTbl.q, TileTbl.r, TileTbl.type)
						.items(batch.map {
							SQL.item()
								.set(TileTbl.id, it.id)
								.set(TileTbl.gameId, it.gameId)
								.set(TileTbl.q, it.q)
								.set(TileTbl.r, it.r)
								.set(TileTbl.type, it.type)
						})
				}
			}
			.mapError { GenericDatabaseError }
	}


}