package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.allColumns
import de.ruegnerlukas.kdbl.builder.and
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryPlayer

class QueryPlayerImpl(private val database: Database) : QueryPlayer {

	override suspend fun execute(userId: String, gameId: String): Either<EntityNotFoundError, PlayerEntity> {
		try {
			return database
				.startQuery("player.query.by-user-and-game") {
					SQL
						.select(PlayerTbl.allColumns())
						.from(PlayerTbl)
						.where(
							PlayerTbl.userId.isEqual(placeholder("userId"))
									and PlayerTbl.gameId.isEqual(placeholder("gameId"))

						)
				}
				.parameters {
					it["userId"] = userId
					it["gameId"] = gameId
				}
				.execute()
				.getOne { row ->
					PlayerEntity(
						id = row.getString(PlayerTbl.id),
						userId = row.getString(PlayerTbl.userId),
						gameId = row.getString(PlayerTbl.gameId),
						connectionId = row.getIntOrNull(PlayerTbl.connectionId),
						state = row.getString(PlayerTbl.state),
						countryId = row.getString(PlayerTbl.countryId)
					)
				}
				.right()
		} catch (e: NoSuchElementException) {
			return EntityNotFoundError.left()
		}
	}

}