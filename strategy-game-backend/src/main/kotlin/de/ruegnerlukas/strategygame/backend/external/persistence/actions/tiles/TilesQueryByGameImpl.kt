package de.ruegnerlukas.strategygame.backend.external.persistence.actions.tiles

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.TileTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.tiles.TilesQueryByGame
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.mapError

class TilesQueryByGameImpl(private val database: Database) : TilesQueryByGame {

	override suspend fun execute(gameId: String): Either<List<TileEntity>, ApplicationError> {
		return Either
			.runCatching(NoSuchElementException::class) {
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
			.mapError { EntityNotFoundError }
	}


}