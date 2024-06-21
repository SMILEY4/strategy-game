package io.github.smiley4.strategygame.backend.commonarangodb

data class DocumentHandle(
	val key: String,
	val id: String,
	val rev: String
)