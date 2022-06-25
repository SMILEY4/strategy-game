package de.ruegnerlukas.strategygame.backend.external.persistence.actions.game

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.SQL.item
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.GameTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.ApplicationError
import de.ruegnerlukas.strategygame.backend.ports.errors.GenericDatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.shared.either.Either
import de.ruegnerlukas.strategygame.backend.shared.either.mapError

class GameInsert(private val database: Database) {

	suspend fun execute(game: GameEntity): Either<Unit, ApplicationError> {
		return Either
			.runCatching {
				database
					.startInsert("game.insert") {
						SQL
							.insert()
							.into(GameTbl)
							.columns(GameTbl.id, GameTbl.turn)
							.items(
								item()
									.set(GameTbl.id, placeholder("id"))
									.set(GameTbl.turn, placeholder("turn"))
							)
					}
					.parameters {
						it["id"] = game.id
						it["turn"] = game.turn
					}
					.execute()
			}
			.mapError { GenericDatabaseError }
	}

}
