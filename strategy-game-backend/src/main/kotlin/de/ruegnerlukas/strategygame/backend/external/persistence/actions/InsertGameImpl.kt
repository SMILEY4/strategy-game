package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.GameTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.TileTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.WorldTbl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameCreateEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.InsertGame

class InsertGameImpl(private val database: Database) : InsertGame {

	override suspend fun execute(game: GameCreateEntity) {
		database.startTransaction(true) { txDb ->
			// WorldTbl
			txDb
				.startInsert("game.insert#world") {
					SQL
						.insert()
						.into(WorldTbl)
						.columns(WorldTbl.id)
						.items(
							SQL.item()
								.set(WorldTbl.id, placeholder("id"))
						)
				}
				.parameters {
					it["id"] = game.world.id
				}
				.execute()
			// GameTbl
			txDb
				.startInsert("game.insert#game") {
					SQL
						.insert()
						.into(GameTbl)
						.columns(GameTbl.id, GameTbl.turn, GameTbl.worldId)
						.items(
							SQL.item()
								.set(GameTbl.id, placeholder("id"))
								.set(GameTbl.turn, placeholder("turn"))
								.set(GameTbl.worldId, placeholder("worldId"))
						)
				}
				.parameters {
					it["id"] = game.id
					it["turn"] = game.turn
					it["worldId"] = game.world.id
				}
				.execute()
			// TileTbl
			txDb.insertBatched(50, game.world.tiles) { batch ->
				SQL
					.insert()
					.into(TileTbl)
					.columns(TileTbl.id, TileTbl.worldId, TileTbl.q, TileTbl.r, TileTbl.type)
					.items(batch.map {
						SQL.item()
							.set(TileTbl.id, it.id)
							.set(TileTbl.worldId, it.worldId)
							.set(TileTbl.q, it.q)
							.set(TileTbl.r, it.r)
							.set(TileTbl.type, it.type)
					})
			}
		}
	}

}