package de.ruegnerlukas.strategygame.backend.external.persistence.actions.game

import arrow.core.Either
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.GameTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameQuery

class GameQueryImpl(private val database: Database) : GameQuery {

	override suspend fun execute(id: String): Either<DatabaseError, GameEntity> {
		return Either
			.catch {
				database
					.startQuery("game.query") {
						SQL
							.select(GameTbl.id, GameTbl.turn, GameTbl.seed)
							.from(GameTbl)
							.where(GameTbl.id.isEqual(placeholder("gameId")))
					}
					.parameters {
						it["gameId"] = id
					}
					.execute()
					.getOne {
						GameEntity(
							id = it.getString(GameTbl.id),
							turn = it.getInt(GameTbl.turn),
							seed = it.getInt(GameTbl.seed)
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