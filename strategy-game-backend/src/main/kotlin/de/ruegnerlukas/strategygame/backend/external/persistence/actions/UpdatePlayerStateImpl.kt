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
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.UpdatePlayerState

class UpdatePlayerStateImpl(private val database: Database) : UpdatePlayerState {

	override suspend fun execute(playerId: String, state: String): Either<EntityNotFoundError, Unit> {
		val count = database
			.startUpdate("players.update.set-state") {
				SQL
					.update(PlayerTbl)
					.set { it[PlayerTbl.state] = placeholder("state") }
					.where(PlayerTbl.id.isEqual(placeholder("playerId")))
			}
			.parameters {
				it["playerId"] = playerId
				it["state"] = state
			}
			.executeCounting()
		if (count == 0) {
			return EntityNotFoundError.left()
		} else {
			return Unit.right()
		}
	}

}