package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.GameTbl
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.UpdateGameTurn

class UpdateGameTurnImpl(private val database: Database) : UpdateGameTurn {

	override suspend fun execute(gameId: String, turn: Int): Either<EntityNotFoundError, Unit> {
		try {
			database
				.startUpdate("game.update.turn") {
					SQL
						.update(GameTbl)
						.set { it[GameTbl.turn] = placeholder("turn") }
						.where(GameTbl.id.isEqual(placeholder("gameId")))
						.returning(GameTbl.id)
				}
				.parameters {
					it["gameId"] = gameId
					it["turn"] = turn
				}
				.executeReturning()
				.checkOne()
			return Unit.right()
		} catch (e: NoSuchElementException) {
			return EntityNotFoundError.left()
		}
	}

}