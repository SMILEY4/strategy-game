package de.ruegnerlukas.strategygame.backend.external.persistence

import de.ruegnerlukas.kdbl.codegen.SQLCodeGeneratorImpl
import de.ruegnerlukas.kdbl.codegen.dialects.SQLiteDialect
import de.ruegnerlukas.kdbl.db.Database
import de.ruegnerlukas.kdbl.db.SingleConnectionDatabase
import de.ruegnerlukas.strategygame.backend.config.DbConfig
import java.sql.DriverManager

object DatabaseProvider {

	suspend fun create(config: DbConfig): Database {
		val database = createDatabaseInstance(config)
		DbSchema.createTables(database)
		return database
	}

	private fun createDatabaseInstance(config: DbConfig): Database {
		return when (config.active) {
			"sqlite" -> SingleConnectionDatabase(
				DriverManager.getConnection(config.sqlite.url),
				SQLCodeGeneratorImpl(SQLiteDialect())
			)
			"sqlite-memory" -> SingleConnectionDatabase(
				DriverManager.getConnection(config.sqliteMemory.url),
				SQLCodeGeneratorImpl(SQLiteDialect())
			)
			else -> throw UnsupportedOperationException("active db-config '${config.active}' not supported")
		}
	}

}