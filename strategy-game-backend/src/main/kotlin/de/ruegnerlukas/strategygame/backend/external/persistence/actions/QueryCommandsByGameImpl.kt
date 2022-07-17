package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.allColumns
import de.ruegnerlukas.kdbl.builder.and
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.CommandTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.GameTbl
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CommandEntity
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.QueryCommandsByGame

class QueryCommandsByGameImpl(private val database: Database) : QueryCommandsByGame {

	override suspend fun execute(gameId: String, turn: Int): List<CommandEntity> {
		return database
			.startQuery("commands.query.by-game-and-turn") {
				SQL
					.select(CommandTbl.allColumns())
					.from(CommandTbl, PlayerTbl)
					.where(
						CommandTbl.playerId.isEqual(PlayerTbl.id)
								and PlayerTbl.gameId.isEqual(placeholder("gameId"))
								and CommandTbl.turn.isEqual(placeholder("turn"))
					)
			}
			.parameters {
				it["gameId"] = gameId
				it["turn"] = turn
			}
			.execute()
			.getMultipleOrNone { row ->
				CommandEntity(
					id = row.getString(CommandTbl.id),
					playerId = row.getString(CommandTbl.playerId),
					turn = row.getInt(CommandTbl.turn),
					type = row.getString(CommandTbl.type),
					data = row.getString(CommandTbl.data),
				)
			}
	}

}