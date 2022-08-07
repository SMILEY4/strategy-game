package de.ruegnerlukas.strategygame.backend.shared.arango

data class DocumentHandle(
	val key: String,
	val id: String,
	val rev: String
)