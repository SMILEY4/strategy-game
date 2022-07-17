package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.UpdatePlayerConnection

class UpdatePlayerConnectionImpl(private val database: Database) : UpdatePlayerConnection {

	override suspend fun execute(playerId: String, connectionId: Int?): Either<EntityNotFoundError, Unit> {
		try {
			database
				.startUpdate("player.update.connection") {
					SQL
						.update(PlayerTbl)
						.set { it[PlayerTbl.connectionId] = placeholder("connectionId") }
						.where(PlayerTbl.id.isEqual(placeholder("playerId")))
						.returning(PlayerTbl.id)
				}
				.parameters {
					it["playerId"] = playerId
					it["connectionId"] = connectionId
				}
				.executeReturning()
				.checkOne()
			return Unit.right()
		} catch (e: NoSuchElementException) {
			return EntityNotFoundError.left()
		}
	}

}