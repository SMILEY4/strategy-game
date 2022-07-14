package de.ruegnerlukas.strategygame.backend.external.persistence.actions.tiles

import arrow.core.Either
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.and
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.TileTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.tiles.TileQueryByGameAndPosition

class TileQueryByGameAndPositionImpl(private val database: Database) : TileQueryByGameAndPosition {

	override suspend fun execute(gameId: String, q: Int, r: Int): Either<DatabaseError, TileEntity> {
		return Either
			.catch {
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