package de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema

enum class ColumnDataType(val sql: String) {
	INTEGER("INTEGER"),
	TEXT("TEXT"),
	BOOLEAN("BOOLEAN"),
}