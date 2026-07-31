package io.github.smiley4.strategygame.shared.arangodb

/**
 * Base class for errors from the ArangoDB layer.
 */
sealed class ArangoDbError(
	val arangoErrorCode: Int,
	val description: String
) : Exception("[$arangoErrorCode] $description")

/**
 * A unique constraint was violated during a write operation.
 */
class UniqueConstraintViolationError : ArangoDbError(1210, "Will be raised when there is a unique constraint violation.")

/**
 * A document with the given identifier was not found.
 */
class DocumentNotFoundError : ArangoDbError(1202 , "Will be raised when a document with a given identifier is unknown.")

//class CollectionOrViewNotFoundError(val name: String) : ArangoDbError(1203 , "Collection or view with the given name not found: $name")