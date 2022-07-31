package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.GameTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.TileTbl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameCreateEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.InsertGame

class InsertGameImpl(private val database: Database) : InsertGame {

	override suspend fun execute(game: GameCreateEntity) {
		database.startTransaction(true) { txDb ->
			// GameTbl
			txDb
				.startInsert("game.insert#game") {
					SQL
						.insert()
						.into(GameTbl)
						.columns(GameTbl.id, GameTbl.turn)
						.items(
							SQL.item()
								.set(GameTbl.id, placeholder("id"))
								.set(GameTbl.turn, placeholder("turn"))
						)
				}
				.parameters {
					it["id"] = game.id
					it["turn"] = game.turn
				}
				.execute()
			// TileTbl
			txDb.insertBatched(50, game.tiles) { batch ->
				SQL
					.insert()
					.into(TileTbl)
					.columns(TileTbl.id, TileTbl.gameId, TileTbl.q, TileTbl.r, TileTbl.type)
					.items(batch.map {
						SQL.item()
							.set(TileTbl.id, it.id)
							.set(TileTbl.gameId, it.gameId)
							.set(TileTbl.q, it.q)
							.set(TileTbl.r, it.r)
							.set(TileTbl.type, it.type)
					})
			}
		}
	}

}