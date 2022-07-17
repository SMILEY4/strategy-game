package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.allColumns
import de.ruegnerlukas.kdbl.builder.and
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.GameTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryGamesByUser

class QueryGamesByUserImpl(private val database: Database) : QueryGamesByUser {

	override suspend fun execute(userId: String): List<GameEntity> {
		return database
			.startQuery("games.query.by-user") {
				SQL
					.select(GameTbl.allColumns())
					.from(GameTbl, PlayerTbl)
					.where(
						GameTbl.id.isEqual(PlayerTbl.gameId)
								and PlayerTbl.userId.isEqual(placeholder("userId"))
					)
			}
			.parameters {
				it["userId"] = userId
			}
			.execute()
			.getMultipleOrNone { row ->
				GameEntity(
					id = row.getString(GameTbl.id),
					turn = row.getInt(GameTbl.turn),
					worldId = row.getString(GameTbl.worldId),
				)
			}
	}
}