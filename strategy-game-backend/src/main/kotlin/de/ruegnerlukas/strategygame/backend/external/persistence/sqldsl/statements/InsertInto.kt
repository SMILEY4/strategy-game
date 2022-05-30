package de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.statements

import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema.Column
import de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema.Table


class InsertIntoStatement(val table: Table) {

	fun columns(vararg columns: Column): InsertIntoStatement {
		return this
	}

	fun columns(columns: List<Column>): InsertIntoStatement {
		return this
	}

	fun allColumns(): InsertIntoStatement {
		return this
	}

	fun item(block: InsertItem.() -> Unit): InsertIntoStatement {
		val item = InsertItem()
		item.block()
		return this
	}

}

class InsertItem() {
	fun set(column: Column, value: Any) {

	}
}


fun insertInto(table: Table): InsertIntoStatement {
	return InsertIntoStatement(table)
}
