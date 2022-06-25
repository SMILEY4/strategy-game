package de.ruegnerlukas.strategygame.backend.external.persistence.actions.player

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl.connectionId
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GenericDatabaseError
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.discardValue
import de.ruegnerlukas.strategygame.backend.shared.either.mapError
import kotlin.collections.set

class PlayerUpdateState(private val database: Database) {

	suspend fun execute(playerId: String, state: String): Either<Unit, ApplicationError> {
		return Either
			.runCatching {
				database
					.startUpdate("player.update.state") {
						SQL
							.update(PlayerTbl)
							.set { it[PlayerTbl.state] = placeholder("state") }
							.where(PlayerTbl.id.isEqual(placeholder("id")))
							.returning(PlayerTbl.id)
					}
					.parameters {
						it["id"] = playerId
						it["state"] = state
					}
					.executeReturning()
					.checkOne()
			}
			.mapError {
				when (it) {
					is NoSuchElementException -> GameNotFoundError
					else -> GenericDatabaseError
				}
			}
			.discardValue()
	}

}
