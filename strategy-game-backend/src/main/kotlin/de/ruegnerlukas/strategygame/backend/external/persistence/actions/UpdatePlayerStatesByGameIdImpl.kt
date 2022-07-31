package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.UpdatePlayerStatesByGameId

class UpdatePlayerStatesByGameIdImpl(private val database: Database) : UpdatePlayerStatesByGameId {

	override suspend fun execute(gameId: String, state: String) {
		database
			.startUpdate("players.update.by-game.set-state") {
				SQL
					.update(PlayerTbl)
					.set { it[PlayerTbl.state] = placeholder("state") }
					.where(PlayerTbl.gameId.isEqual(placeholder("gameId")))
			}
			.parameters {
				it["gameId"] = gameId
				it["state"] = state
			}
			.execute()
	}

}