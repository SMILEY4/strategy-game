package de.ruegnerlukas.strategygame.backend.external.persistence.actions.player

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerUpdateConnection
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.discardValue
import de.ruegnerlukas.strategygame.backend.shared.either.mapError
import kotlin.collections.set

class PlayerUpdateConnectionImpl(private val database: Database) : PlayerUpdateConnection {

	override suspend fun execute(playerId: String, connectionId: Int?): Either<Unit, ApplicationError> {
		return Either
			.runCatching(NoSuchElementException::class) {
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
			.mapError { EntityNotFoundError }
			.discardValue()
	}

}
