package de.ruegnerlukas.strategygame.backend.external.persistence.actions.player

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerUpdateConnectionByUserSetNull
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.discardValue
import kotlin.collections.set

class PlayerUpdateConnectionByUserSetNullImpl(private val database: Database) : PlayerUpdateConnectionByUserSetNull {

	override suspend fun execute(userId: String): Either<Unit, ApplicationError> {
		return Either.run {
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
		}.discardValue()
	}

}
