package de.ruegnerlukas.strategygame.backend.external.persistence.arango

data class DocumentHandle(
	val key: String,
	val id: String,
	val rev: String
)