package io.github.smiley4.strategygame.shared.arangodb

data class DocumentHandle(
	val key: String,
	val id: String,
	val rev: String
)