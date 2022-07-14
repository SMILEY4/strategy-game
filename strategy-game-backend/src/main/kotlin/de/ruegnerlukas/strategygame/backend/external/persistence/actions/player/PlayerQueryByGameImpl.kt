package de.ruegnerlukas.strategygame.backend.external.persistence.actions.player

import arrow.core.Either
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerQueryByGame

class PlayerQueryByGameImpl(private val database: Database) : PlayerQueryByGame {

	override suspend fun execute(gameId: String): Either<DatabaseError, List<PlayerEntity>> {
		return Either
			.catch {
				database
					.startQuery("player.query.by_game") {
						SQL
							.select(PlayerTbl.id, PlayerTbl.userId, PlayerTbl.gameId, PlayerTbl.connectionId, PlayerTbl.state)
							.from(PlayerTbl)
							.where(PlayerTbl.gameId.isEqual(placeholder("gameId")))
					}
					.parameters {
						it["gameId"] = gameId
					}
					.execute()
					.getMultipleOrNone { rs ->
						PlayerEntity(
							id = rs.getString(PlayerTbl.id),
							userId = rs.getString(PlayerTbl.userId),
							gameId = rs.getString(PlayerTbl.gameId),
							connectionId = rs.getIntOrNull(PlayerTbl.connectionId),
							state = rs.getString(PlayerTbl.state)
						)
					}
			}
			.mapLeft { throw it }
	}

}