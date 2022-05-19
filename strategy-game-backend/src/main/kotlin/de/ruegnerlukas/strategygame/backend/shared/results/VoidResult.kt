package de.ruegnerlukas.strategygame.backend.shared.results

open class VoidResult(private val successful: Boolean, private val error: String?) {
	companion object {
		fun success(): VoidResult {
			return VoidResult(true, null)
		}

		fun error(error: String): VoidResult {
			return VoidResult(false, error)
		}
	}

	fun isSuccess(): Boolean {
		return successful
	}

	fun isError(): Boolean {
		return !successful
	}

	fun isError(expectedError: String): Boolean {
		return getError() == expectedError
	}

	fun getError(): String {
		return error ?: ""
	}

	suspend fun onError(handler: suspend (error: String) -> Unit): VoidResult {
		if (isError()) {
			handler(getError())
		}
		return this
	}

	fun mapToVoidResult(successHandler: () -> VoidResult, errorHandler: (error: String) -> VoidResult): VoidResult {
		return if (isError()) {
			errorHandler(getError())
		} else {
			successHandler()
		}
	}

	fun <T> mapToResult(successHandler: () -> Result<T>, errorHandler: (error: String) -> Result<T>): Result<T> {
		return if (isError()) {
			errorHandler(getError())
		} else {
			successHandler()
		}
	}

}