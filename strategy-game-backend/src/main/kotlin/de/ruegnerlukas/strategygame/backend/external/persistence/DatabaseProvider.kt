package de.ruegnerlukas.strategygame.backend.external.persistence

import de.ruegnerlukas.kdbl.codegen.SQLCodeGeneratorImpl
import de.ruegnerlukas.kdbl.codegen.dialects.SQLiteDialect
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.kdbl.db.SingleConnectionDatabase
import de.ruegnerlukas.strategygame.backend.shared.DbConfig
import java.sql.DriverManager

object DatabaseProvider {

	fun create(config: DbConfig): Database {
		if (config.active == "sqlite") {
			return SingleConnectionDatabase(
				DriverManager.getConnection(config.sqlite.url),
				SQLCodeGeneratorImpl(SQLiteDialect())
			)
		} else {
			throw UnsupportedOperationException("active db-config '${config.active}' not supported")
		}
	}

}