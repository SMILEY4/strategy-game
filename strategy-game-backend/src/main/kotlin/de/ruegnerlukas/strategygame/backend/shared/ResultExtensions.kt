package de.ruegnerlukas.strategygame.backend.shared


fun <T> Result.Companion.failure(error: String): Result<T> {
	return Result.failure(RuntimeException(error))
}