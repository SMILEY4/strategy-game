package de.ruegnerlukas.strategygame.backend.common.persistence.arango

sealed class ArangoDbError(
	val arangoErrorCode: Int,
	val description: String
) : Exception("[$arangoErrorCode] $description")

class UniqueConstraintViolationError : ArangoDbError(1210, "Will be raised when there is a unique constraint violation.")

class DocumentNotFoundError : ArangoDbError(1202 , "Will be raised when a document with a given identifier is unknown.")