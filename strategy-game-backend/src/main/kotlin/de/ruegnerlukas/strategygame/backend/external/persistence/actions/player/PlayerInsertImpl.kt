package de.ruegnerlukas.strategygame.backend.external.persistence.actions.player

import arrow.core.Either
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerInsert

class PlayerInsertImpl(private val database: Database) : PlayerInsert {

	override suspend fun execute(player: PlayerEntity): Either<DatabaseError, Unit> {
		return Either
			.catch {
				database
					.startInsert("player.insert") {
						SQL
							.insert()
							.into(PlayerTbl)
							.columns(PlayerTbl.id, PlayerTbl.userId, PlayerTbl.gameId, PlayerTbl.connectionId, PlayerTbl.state)
							.items(
								SQL.item()
									.set(PlayerTbl.id, placeholder("id"))
									.set(PlayerTbl.userId, placeholder("userId"))
									.set(PlayerTbl.gameId, placeholder("gameId"))
									.set(PlayerTbl.connectionId, placeholder("connectionId"))
									.set(PlayerTbl.state, placeholder("state"))
							)
					}
					.parameters {
						it["id"] = player.id
						it["userId"] = player.userId
						it["gameId"] = player.gameId
						it["connectionId"] = player.connectionId
						it["state"] = player.state
					}
					.execute()
			}
			.mapLeft { throw it }
	}

}
