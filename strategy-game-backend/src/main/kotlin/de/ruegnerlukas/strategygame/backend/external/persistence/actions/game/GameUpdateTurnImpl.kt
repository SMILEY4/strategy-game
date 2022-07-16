package de.ruegnerlukas.strategygame.backend.external.persistence.actions.game

import arrow.core.Either
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.GameTbl
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.EntityNotFoundError
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameUpdateTurn
import kotlin.collections.set

class GameUpdateTurnImpl(private val database: Database) : GameUpdateTurn {

	override suspend fun execute(id: String, turn: Int): Either<DatabaseError, Unit> {
		return Either
			.catch {
				database
					.startUpdate("game.update.turn") {
						SQL
							.update(GameTbl)
							.set { it[GameTbl.turn] = placeholder("turn") }
							.where(GameTbl.id.isEqual(placeholder("id")))
							.returning(GameTbl.id)
					}
					.parameters {
						it["id"] = id
						it["turn"] = turn
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
	}

}
