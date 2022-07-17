package de.ruegnerlukas.strategygame.backend.external.persistence.actions

import de.ruegnerlukas.kdbl.builder.SQL
import de.ruegnerlukas.kdbl.builder.isEqual
import de.ruegnerlukas.kdbl.builder.placeholder
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.strategygame.backend.external.persistence.PlayerTbl
import de.ruegnerlukas.strategygame.backend.ports.required.persistence.UpdatePlayerConnectionsSetNull

class UpdatePlayerConnectionsSetNullImpl(private val database: Database) : UpdatePlayerConnectionsSetNull {

	override suspend fun execute(userId: String) {
		database
			.startUpdate("players.update.set-connection-null") {
				SQL
					.update(PlayerTbl)
					.set { it[PlayerTbl.connectionId] = null }
					.where(PlayerTbl.userId.isEqual(placeholder("userId")))
			}
			.parameters {
				it["userId"] = userId
			}
			.execute()
	}

}