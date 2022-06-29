package de.ruegnerlukas.strategygame.backend.external.persistence.actions.player

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.player.PlayerUpdateStateByGame
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.discardValue
import kotlin.collections.set

class PlayerUpdateStateByGameImpl(private val database: Database) : PlayerUpdateStateByGame {

	override suspend fun execute(gameId: String, state: String): Either<Unit, ApplicationError> {
		return Either.run {
			database
				.startUpdate("player.update.state.by_game") {
					SQL
						.update(PlayerTbl)
						.set { it[PlayerTbl.state] = placeholder("state") }
						.where(PlayerTbl.gameId.isEqual(placeholder("gameId")))
						.returning(PlayerTbl.id)
				}
				.parameters {
					it["state"] = state
					it["gameId"] = gameId
				}
				.executeReturning()
		}.discardValue()
	}

}
