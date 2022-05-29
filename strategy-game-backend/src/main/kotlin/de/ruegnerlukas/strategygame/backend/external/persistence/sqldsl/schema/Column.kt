package de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema

import de.ruegnerlukas.strategygame.backend.external.persistence.TableDefinitions.Participant.registerColumn

open class Column(val name: String, val dataType: ColumnDataType) {

	val constraints = mutableListOf<ColumnConstraint>()

	fun primaryKey(): Column {
		constraints.add(PrimaryKeyConstraint())
		return this
	}

	fun autoIncrement(): Column {
		constraints.add(AutoIncrementPseudoConstraint())
		return this
	}

	fun notNull(): Column {
		constraints.add(NotNullConstraint())
		return this
	}

	fun foreignKey(table: Table, onDelete: OnDelete = OnDelete.NO_ACTION, onUpdate: OnUpdate = OnUpdate.NO_ACTION): Column {
		constraints.add(ForeignKeyConstraint(table, onDelete, onUpdate))
		return this
	}

}


fun Table.integer(name: String): Column {
	return Column(name, ColumnDataType.INTEGER).apply { registerColumn(this) }
}

fun Table.text(name: String): Column {
	return Column(name, ColumnDataType.TEXT).apply { registerColumn(this) }
}

fun Table.boolean(name: String): Column {
	return Column(name, ColumnDataType.BOOLEAN).apply { registerColumn(this) }
}


