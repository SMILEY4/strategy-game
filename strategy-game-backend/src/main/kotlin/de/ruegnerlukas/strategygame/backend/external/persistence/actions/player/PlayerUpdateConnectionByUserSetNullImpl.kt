package de.ruegnerlukas.strategygame.backend.external.persistence.actions.player

import arrow.core.Either
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerUpdateConnectionByUserSetNull
import kotlin.collections.set

class PlayerUpdateConnectionByUserSetNullImpl(private val database: Database) : PlayerUpdateConnectionByUserSetNull {

	override suspend fun execute(userId: String): Either<DatabaseError, Unit> {
		return Either
			.catch {
				database
					.startUpdate("player.update.connectionId.by_user_id.set_null") {
						SQL
							.update(PlayerTbl)
							.set { it[PlayerTbl.connectionId] = null }
							.where(PlayerTbl.userId.isEqual(placeholder("userId")))
							.returning(PlayerTbl.id)
					}
					.parameters {
						it["userId"] = userId
					}
					.executeReturning()
			}
			.mapLeft { throw it }
			.void()
	}

}
