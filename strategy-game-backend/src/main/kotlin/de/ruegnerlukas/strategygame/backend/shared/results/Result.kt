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

	fun get(): T? {
		return value
	}

	fun getOrThrow(): T {
		return value ?: throw IllegalStateException()
	}

	fun onSuccess(handler: (value: T) -> Unit): Result<T> {
		if (isSuccess()) {
			handler(getOrThrow())
		}
		return this
	}

}