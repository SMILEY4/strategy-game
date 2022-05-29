package de.ruegnerlukas.strategygame.backend.external.persistence.sqldsl.schema

enum class OnUpdate(val sql: String) {
	NO_ACTION("NO ACTION"),
	CASCADE("CASCADE"),
	RESTRICT("RESTRICT"),
	SET_NULL("SET NULL"),
}