package de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.generator.createtable

import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.generator.CsvListToken
import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.generator.GroupToken
import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.generator.ListToken
import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.generator.NoOpToken
import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.generator.StringToken
import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.generator.Token
import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema.AutoIncrementPseudoConstraint
import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema.Column
import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema.ForeignKeyConstraint
import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema.NotNullConstraint
import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema.OnDelete
import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema.OnUpdate
import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema.PrimaryKeyConstraint
import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema.Table
import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema.UniqueConstraint

/**
 * https://www.sqlite.org/lang_createtable.html
 */
class SQLiteCreateTable: CreateTable {

	override fun build(table: Table): String {
		return ListToken()
			.add("CREATE TABLE")
			.addIf("IF NOT EXISTS") { table.ifNotExists }
			.add(table.tableName)
			.add(
				GroupToken(
					CsvListToken(
						mutableListOf(
							columnDefinitions(table),
							tableConstraints(table)
						)
					)
				)
			)
			.buildString()
	}

	private fun columnDefinitions(table: Table): Token {
		val root = CsvListToken()
		table.getColumns().forEach {
			root.add(columnDefinition(it, table))
		}
		return root
	}

	private fun columnDefinition(column: Column, table: Table): Token {
		val primaryKeyCount = table.getColumns().count { it.isPrimaryKey() }
		return ListToken()
			.add(column.name)
			.add(column.dataType.sql)
			.then {
				column.constraints.forEach {
					when (it) {
						is PrimaryKeyConstraint -> {
							if (primaryKeyCount == 1) {
								add("PRIMARY KEY")
								if (column.isAutoIncrement()) {
									add("AUTOINCREMENT")
								}
							}
						}
						is NotNullConstraint -> add("NOT NULL")
						is UniqueConstraint -> add("UNIQUE")
						is ForeignKeyConstraint -> {
							add("REFERENCES")
							add(it.table.tableName)
							if (it.onDelete != OnDelete.NO_ACTION) {
								add("ON DELETE")
								add(it.onDelete.sql)
							}
							if (it.onUpdate != OnUpdate.NO_ACTION) {
								add("ON UPDATE")
								add(it.onUpdate.sql)
							}
						}
					}
				}
			}
	}


	private fun tableConstraints(table: Table): Token {
		val primaryKeys = table.getColumns().filter { it.isPrimaryKey() }.map { it.name }
		if (primaryKeys.size > 1) {
			return ListToken()
				.add("PRIMARY KEY")
				.add(
					GroupToken(
						CsvListToken(primaryKeys.map { StringToken(it) })
					)
				)
		} else {
			return NoOpToken()
		}
	}

	private fun Column.isPrimaryKey(): Boolean {
		return constraints.filterIsInstance<PrimaryKeyConstraint>().isNotEmpty()
	}

	private fun Column.isAutoIncrement(): Boolean {
		return constraints.filterIsInstance<AutoIncrementPseudoConstraint>().isNotEmpty()
	}

}