package de.ruegnerlukas.strategygame.backend.external.persistence.actions.player

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.GenericDatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerInsert
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.mapError

class PlayerInsertImpl(private val database: Database): PlayerInsert {

	override suspend fun execute(player: PlayerEntity): Either<Unit, ApplicationError> {
		return Either
			.runCatching {
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
			.mapError { GenericDatabaseError }
	}

}
