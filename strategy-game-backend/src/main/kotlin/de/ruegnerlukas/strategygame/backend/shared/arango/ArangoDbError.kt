package de.ruegnerlukas.strategygame.backend.shared.arango

sealed class ArangoDbError(
	val errorCode: Int,
	val description: String
)

object UniqueConstraintViolationError : ArangoDbError(1210, "Will be raised when there is a unique constraint violation.")
object DocumentNotFoundError : ArangoDbError(1202 , "Will be raised when a document with a given identifier is unknown.")