package de.ruegnerlukas.strategygame.backend.external.persistence.actions.tiles

import arrow.core.Either
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.TileTbl
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.tiles.TilesQueryByGame

class TilesQueryByGameImpl(private val database: Database) : TilesQueryByGame {

	override suspend fun execute(gameId: String): Either<DatabaseError, List<TileEntity>> {
		return Either
			.catch {
				database
					.startQuery("tiles.query.by_game_id") {
						SQL
							.select(TileTbl.id, TileTbl.gameId, TileTbl.q, TileTbl.r, TileTbl.type)
							.from(TileTbl)
							.where(TileTbl.gameId.isEqual(placeholder("gameId")))
					}
					.parameter("gameId", gameId)
					.execute()
					.getMultiple {
						TileEntity(
							id = it.getString(TileTbl.id),
							gameId = it.getString(TileTbl.gameId),
							q = it.getInt(TileTbl.q),
							r = it.getInt(TileTbl.r),
							type = it.getString(TileTbl.type)
						)
					}
			}
			.mapLeft { e ->
				when (e) {
					is NoSuchElementException -> EntityNotFoundError
					else -> throw e
				}
			}
	}


}