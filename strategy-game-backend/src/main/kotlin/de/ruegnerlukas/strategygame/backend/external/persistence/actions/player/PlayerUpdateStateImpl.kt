package de.ruegnerlukas.strategygame.backend.external.persistence.actions.player

import arrow.core.Either
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerUpdateState
import kotlin.collections.set

class PlayerUpdateStateImpl(private val database: Database) : PlayerUpdateState {

	override suspend fun execute(id: String, state: String): Either<DatabaseError, Unit> {
		return Either
			.catch {
				database
					.startUpdate("player.update.state") {
						SQL
							.update(PlayerTbl)
							.set { it[PlayerTbl.state] = placeholder("state") }
							.where(PlayerTbl.id.isEqual(placeholder("id")))
							.returning(PlayerTbl.id)
					}
					.parameters {
						it["id"] = id
						it["state"] = state
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
