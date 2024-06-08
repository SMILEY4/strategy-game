package io.github.smiley4.strategygame.backend.common.persistence.arango

data class DocumentHandle(
	val key: String,
	val id: String,
	val rev: String
)