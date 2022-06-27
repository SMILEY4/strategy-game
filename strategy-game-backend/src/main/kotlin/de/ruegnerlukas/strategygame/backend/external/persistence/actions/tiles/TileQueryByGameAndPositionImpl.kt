package de.ruegnerlukas.strategygame.backend.external.persistence.actions.tiles

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.and
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.TileTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.tiles.TileQueryByGameAndPosition
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.mapError

class TileQueryByGameAndPositionImpl(private val database: Database) : TileQueryByGameAndPosition {

	override suspend fun execute(gameId: String, q: Int, r: Int): Either<TileEntity, ApplicationError> {
		return Either
			.runCatching(NoSuchElementException::class) {
				database
					.startQuery("tiles.query.by_game_and_position") {
						SQL
							.select(TileTbl.id, TileTbl.gameId, TileTbl.q, TileTbl.r, TileTbl.type)
							.from(TileTbl)
							.where(
								TileTbl.gameId.isEqual(placeholder("gameId"))
										and TileTbl.q.isEqual(placeholder("q"))
										and TileTbl.r.isEqual(placeholder("r"))
							)
					}
					.parameters {
						it["gameId"] = gameId
						it["q"] = q
						it["r"] = r
					}
					.execute()
					.getOne {
						TileEntity(
							id = it.getString(TileTbl.id.columnName),
							gameId = it.getString(TileTbl.gameId.columnName),
							q = it.getInt(TileTbl.q.columnName),
							r = it.getInt(TileTbl.r.columnName),
							type = it.getString(TileTbl.type.columnName)
						)
					}
			}
			.mapError { EntityNotFoundError }
	}


}