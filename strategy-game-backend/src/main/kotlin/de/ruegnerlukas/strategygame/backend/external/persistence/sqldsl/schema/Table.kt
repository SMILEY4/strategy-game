package de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema


open class Table(val tableName: String, val ifNotExists: Boolean = false) {

	private val columns = mutableListOf<Column>()

	internal fun registerColumn(column: Column) {
		columns.add(column)
	}

	fun getColumns(): List<Column> = columns

}
