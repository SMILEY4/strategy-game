package de.ruegnerlukas.strategygame.backend.shared

/**
 * Create a failed result from a string instead of an exception.
 */
fun <T> Result.Companion.failure(error: String): Result<T> {
	return failure(RuntimeException(error))
}