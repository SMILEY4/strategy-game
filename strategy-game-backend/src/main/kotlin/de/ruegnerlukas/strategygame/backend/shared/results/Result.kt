package de.ruegnerlukas.strategygame.backend.shared.results

class Result<T>(successful: Boolean, private val value: T?, error: String?) : VoidResult(successful, error) {
	companion object {
		fun <T> success(value: T): Result<T> {
			return Result(true, value, null)
		}

		fun <T> error(error: String): Result<T> {
			return Result(false, null, error)
		}
	}

	fun getUnsafe(): T? {
		return value
	}

	fun get(): T {
		return value ?: throw IllegalStateException()
	}

	fun getOr(default: T): T {
		return if (isSuccess()) {
			get()
		} else {
			default
		}
	}

	suspend fun onSuccess(handler: suspend (value: T) -> Unit): Result<T> {
		if (isSuccess()) {
			handler(get())
		}
		return this
	}

	fun mapToVoidResult(successHandler: (value: T) -> VoidResult, errorHandler: (error: String) -> VoidResult): VoidResult {
		return if (isError()) {
			errorHandler(getError())
		} else {
			successHandler(get())
		}
	}

	fun mapToResult(successHandler: (value: T) -> Result<T>, errorHandler: (error: String) -> Result<T>): Result<T> {
		return if (isError()) {
			errorHandler(getError())
		} else {
			successHandler(get())
		}
	}

}