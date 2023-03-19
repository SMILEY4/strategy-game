package de.ruegnerlukas.strategygame.backend.external.persistence

import de.ruegnerlukas.strategygame.backend.config.DbConfig
import de.ruegnerlukas.strategygame.backend.shared.arango.ArangoDatabase

object DatabaseProvider {

	suspend fun create(config: DbConfig): ArangoDatabase {
		return ArangoDatabase.create(config.host, config.port, null, null, config.name)
	}

}