package de.ruegnerlukas.strategygame.backend.external.persistence.actions.game

import arrow.core.Either
import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.SQL.item
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.GameTbl
import de.ruegnerlukas.strategygame.backend.ports.errors.DatabaseError
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.game.GameInsert

class GameInsertImpl(private val database: Database) : GameInsert {

	override suspend fun execute(game: GameEntity): Either<DatabaseError, Unit> {
		return Either
			.catch {
				database
					.startInsert("game.insert") {
						SQL
							.insert()
							.into(GameTbl)
							.columns(GameTbl.id, GameTbl.seed, GameTbl.turn)
							.items(
								item()
									.set(GameTbl.id, placeholder("id"))
									.set(GameTbl.turn, placeholder("turn"))
									.set(GameTbl.seed, placeholder("seed"))
							)
					}
					.parameters {
						it["id"] = game.id
						it["turn"] = game.turn
						it["seed"] = game.seed
					}
					.execute()
			}
			.mapLeft { throw it }
	}

}
