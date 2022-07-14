package de.ruegnerlukas.strategygame.backend.external.persistence.actions.player

import arrow.core.Either
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerQuery

class PlayerQueryImpl(private val database: Database) : PlayerQuery {

	override suspend fun execute(id: String): Either<DatabaseError, PlayerEntity> {
		return Either
			.catch {
				database
					.startQuery("player.query") {
						SQL
							.select(PlayerTbl.id, PlayerTbl.userId, PlayerTbl.gameId, PlayerTbl.connectionId, PlayerTbl.state)
							.from(PlayerTbl)
							.where(PlayerTbl.id.isEqual(placeholder("id")))
					}
					.parameters {
						it["id"] = id
					}
					.execute()
					.getOne { rs ->
						PlayerEntity(
							id = rs.getString(PlayerTbl.id),
							userId = rs.getString(PlayerTbl.userId),
							gameId = rs.getString(PlayerTbl.gameId),
							connectionId = rs.getIntOrNull(PlayerTbl.connectionId),
							state = rs.getString(PlayerTbl.state)
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