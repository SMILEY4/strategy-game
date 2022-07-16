package de.ruegnerlukas.strategygame.backend.external.persistence.actions.player

import arrow.core.Either
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerUpdateConnection
import kotlin.collections.set

class PlayerUpdateConnectionImpl(private val database: Database) : PlayerUpdateConnection {

	override suspend fun execute(playerId: String, connectionId: Int?): Either<DatabaseError, Unit> {
		return Either
			.catch {
				database
					.startUpdate("player.update.connectionId") {
						SQL
							.update(PlayerTbl)
							.set { it[PlayerTbl.connectionId] = placeholder("connectionId") }
							.where(PlayerTbl.id.isEqual(placeholder("id")))
							.returning(PlayerTbl.id)
					}
					.parameters {
						it["id"] = playerId
						it["connectionId"] = connectionId
					}
					.executeReturning()
					.checkOne()
			}
			.mapLeft { e ->
				when (e) {
					is NoSuchElementException -> EntityNotFoundError
					else -> throw e
				}
			}
			.void()
	}

}
