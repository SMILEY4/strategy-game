package de.ruegnerlukas.strategygame.backend.external.persistence.actions.player

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GenericDatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerQuery
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.mapError

class PlayerQueryImpl(private val database: Database): PlayerQuery {

	override suspend fun execute(id: String): Either<PlayerEntity, ApplicationError> {
		return Either
			.runCatching {
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
							id = rs.getString(PlayerTbl.id.columnName),
							userId = rs.getString(PlayerTbl.userId.columnName),
							gameId = rs.getString(PlayerTbl.gameId.columnName),
							connectionId = rs.getInt(PlayerTbl.connectionId.columnName).let { if (rs.wasNull()) null else it },
							state = rs.getString(PlayerTbl.state.columnName)
						)
					}
			}
			.mapError {
				when (it) {
					is NoSuchElementException -> EntityNotFoundError
					else -> GenericDatabaseError
				}
			}
	}

}