package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.allColumns
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.GameTbl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryGame

class QueryGameImpl(private val database: Database) : QueryGame {

	override suspend fun execute(gameId: String): Either<EntityNotFoundError, GameEntity> {
		try {
			return database
				.startQuery("game.query") {
					SQL
						.select(GameTbl.allColumns())
						.from(GameTbl)
						.where(
							GameTbl.id.isEqual(placeholder("gameId"))
						)
				}
				.parameters {
					it["gameId"] = gameId
				}
				.execute()
				.getOne { row ->
					GameEntity(
						id = row.getString(GameTbl.id),
						turn = row.getInt(GameTbl.turn)
					)
				}
				.right()
		} catch (e: NoSuchElementException) {
			return EntityNotFoundError.left()
		}
	}

}