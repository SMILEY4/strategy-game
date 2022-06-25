package de.ruegnerlukas.strategygame.backend.external.persistence.actions.game

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.GameTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl.connectionId
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.GameNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.errors.GenericDatabaseError
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.discardValue
import de.ruegnerlukas.strategygame.backend.shared.either.mapError
import kotlin.collections.set

class GameUpdateTurn(private val database: Database) {

	suspend fun execute(gameId: String, turn: Int): Either<Unit, ApplicationError> {
		return Either
			.runCatching {
				database
					.startUpdate("game.update.turn") {
						SQL
							.update(GameTbl)
							.set { it[GameTbl.turn] = placeholder("turn") }
							.where(GameTbl.id.isEqual(placeholder("id")))
							.returning(GameTbl.id)
					}
					.parameters {
						it["id"] = gameId
						it["turn"] = turn
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
