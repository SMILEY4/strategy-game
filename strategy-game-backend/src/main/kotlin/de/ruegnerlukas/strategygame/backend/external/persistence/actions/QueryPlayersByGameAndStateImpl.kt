package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.allColumns
import de.ruegnerlukas.kdbl.builder.and
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.PlayerEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryPlayersByGameAndState

class QueryPlayersByGameAndStateImpl(private val database: Database) : QueryPlayersByGameAndState {

	override suspend fun execute(gameId: String, state: String): List<PlayerEntity> {
		return database
			.startQuery("players.query.by-game-and-state") {
				SQL
					.select(PlayerTbl.allColumns())
					.from(PlayerTbl)
					.where(
						PlayerTbl.gameId.isEqual(placeholder("gameId"))
								and PlayerTbl.state.isEqual(placeholder("state"))
					)
			}
			.parameters {
				it["gameId"] = gameId
				it["state"] = state
			}
			.execute()
			.getMultipleOrNone { row ->
				PlayerEntity(
					id = row.getString(PlayerTbl.id),
					userId = row.getString(PlayerTbl.userId),
					gameId = row.getString(PlayerTbl.gameId),
					connectionId = row.getIntOrNull(PlayerTbl.connectionId),
					state = row.getString(PlayerTbl.state),
					countryId = row.getString(PlayerTbl.countryId)
				)
			}
	}

}