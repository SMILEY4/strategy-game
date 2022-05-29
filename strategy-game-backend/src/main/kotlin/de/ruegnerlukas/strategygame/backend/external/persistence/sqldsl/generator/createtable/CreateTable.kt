package de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.generator.createtable

import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema.Table


interface CreateTable {

	companion object {
		fun sqlite(): SQLiteCreateTable = SQLiteCreateTable()
		fun postgreSql(): PostgreSQLCreateTable = PostgreSQLCreateTable()
	}

	fun build(table: Table): String

}