package de.ruegnerlukas.strategygame.backend.external.persistence.actions.game

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.GameTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GenericDatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.mapError

class GameQuery(private val database: Database) {

	suspend fun execute(gameId: String): Either<GameEntity, ApplicationError> {
		return Either
			.runCatching {
				database
					.startQuery("game.query") {
						SQL
							.select(GameTbl.id, GameTbl.turn)
							.from(GameTbl)
							.where(GameTbl.id.isEqual(placeholder("gameId")))
					}
					.parameters {
						it["gameId"] = gameId
					}
					.execute()
					.getOne { GameEntity(id = it.getString(GameTbl.id.columnName), turn = it.getInt(GameTbl.turn.columnName)) }
			}
			.mapError {
				when (it) {
					is NoSuchElementException -> EntityNotFoundError
					else -> GenericDatabaseError
				}
			}
	}

}