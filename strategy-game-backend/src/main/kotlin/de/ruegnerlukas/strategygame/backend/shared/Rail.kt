package de.ruegnerlukas.strategygame.backend.shared

abstract class Rail<T> : Logging {

	companion object {
		fun begin() = SuccessRail(Unit)
		fun success() = SuccessRail(Unit)
		fun <T> success(value: T) = SuccessRail(value)
		fun <T> error(error: RailError) = ErrorRail<T>(error)
		fun <T> error(errorMessage: String) = ErrorRail<T>(RailError(errorMessage, null))
		fun <T> error(errorMessage: String, error: Throwable) = ErrorRail<T>(RailError(errorMessage, error))
		fun <T> error(error: Throwable) = ErrorRail<T>(RailError(error.message ?: "", error))
	}


	/**
	 * @return whether this rail is currently an error
	 */
	abstract fun isError(): Boolean


	/**
	 * @return whether this rail is currently an error with the given message
	 */
	abstract fun isError(error: String): Boolean


	/**
	 * @return whether this rail is currently a success
	 */
	abstract fun isSuccess(): Boolean


	/**
	 * @return the current value or throw an exception if this rail is an error
	 */
	abstract fun get(): T


	/**
	 * @return the current value or the given default if this rail is an error
	 */
	abstract fun getOrDefault(default: T): T


	/**
	 * @return the current error or throw an exception if this rail is a success
	 */
	abstract fun getError(): RailError


	/**
	 * Maps this [Rail] to a new [Rail]:
	 * - this rail is a success: return the new rail returned by the given [transform]-function
	 * - this rail is an error: return a rail with the original error
	 * Exceptions thrown by the [transform]-function are not caught
	 */
	suspend fun <R> flatMap(transform: suspend (T) -> Rail<R>): Rail<R> {
		return when {
			isSuccess() -> transform(get())
			else -> error(getError())
		}
	}


	/**
	 * Maps this [Rail] to a new [Rail]:
	 * - this rail is a success: return the new rail returned by the given [transform]-function. Replaces the error of the new rail with the given error
	 * - this rail is an error: return a rail with the original error
	 * Exceptions thrown by the [transform]-function are not caught
	 */
	suspend fun <R> flatMap(error: RailError, transform: suspend (T) -> Rail<R>): Rail<R> {
		return when {
			isSuccess() -> transform(get()).mapError { error }
			else -> error(getError())
		}
	}


	/**
	 * Maps this [Rail] to a new [Rail]:
	 * - this rail is a success: return the new rail returned by the given [transform]-function. Replaces the error of the new rail with the given error
	 * - this rail is an error: return a rail with the original error
	 * Exceptions thrown by the [transform]-function are not caught
	 */
	suspend fun <R> flatMap(error: String, transform: suspend (T) -> Rail<R>): Rail<R> {
		return flatMap(RailError(error), transform)
	}


	/**
	 * Maps this [Rail] to a new [Rail]:
	 * - this rail is a success: return the new rail returned by the given [transform]-function. Replaces the error of the new rail with the given error
	 * - this rail is an error: return a rail with the original error
	 * Exceptions thrown by the [transform]-function are not caught
	 */
	suspend fun <R> flatMap(error: Throwable, transform: suspend (T) -> Rail<R>): Rail<R> {
		return flatMap(RailError(error.toString(), error), transform)
	}


	/**
	 * Maps this [Rail] to a new [Rail]:
	 * - this rail is a success: return a new success-rail with the value returned by the given [transform]-function
	 * - this rail is an error: return an error rail with the original error
	 */
	suspend fun <R> map(transform: suspend (T) -> R): Rail<R> {
		return when {
			isSuccess() -> success(transform(get()))
			else -> error(getError())
		}
	}


	/**
	 * Maps this [Rail] to a new [Rail]
	 * - this rail is a success: return a new success-rail with no value
	 * - this rail is an error: return an error rail with the original error
	 */
	fun discardValue(): Rail<Unit> {
		return when {
			isSuccess() -> success()
			else -> error(getError())
		}
	}


	/**
	 * If this rail is a success, the given function is called with the current value without modifying the flow of rails
	 */
	suspend fun peek(block: suspend (T) -> Unit): Rail<T> {
		if (isSuccess()) {
			block(get())
		}
		return this
	}


	/**
	 * Maps this [Rail] to a new [Rail]:
	 * this rail is a success: returns a success rail with the original value
	 * this rail is an error: returns the new rail with the error returned by the given [transform]-function
	 */
	fun mapError(transform: (RailError) -> RailError): Rail<T> {
		return when {
			isError() -> error(transform(getError()))
			else -> this
		}
	}


	/**
	 * Maps this [Rail] to a new [Rail]:
	 * this rail is a success: returns a success rail with the original value
	 * this rail is an error: returns the new rail with the given error
	 */
	fun mapError(error: RailError): Rail<T> {
		return mapError { error }
	}


	/**
	 * Maps this [Rail] to a new [Rail]:
	 * this rail is a success: returns a success rail with the original value
	 * this rail is an error: returns the new rail with the given error
	 */
	fun mapError(error: String): Rail<T> {
		return mapError { RailError(error) }
	}


	/**
	 * Maps this [Rail] to a new [Rail]:
	 * this rail is a success: returns a success rail with the original value
	 * this rail is an error: returns the new rail with the given error
	 */
	fun mapError(error: Throwable): Rail<T> {
		return mapError { RailError(error.toString(), error) }
	}


	/**
	 * Maps this [Rail] to a new [Rail]:
	 * this rail is a success: returns a success rail with the original value
	 * this rail is an error: returns the new rail returned by the given [transform]-function
	 */
	fun catch(transform: (RailError) -> Rail<T>): Rail<T> {
		return when {
			isError() -> transform(getError())
			else -> this
		}
	}


	/**
	 * Maps this [Rail] to a single value by applying the [onSuccess] or [onError] functions depending on the state of this rail
	 */
	suspend fun <R> fold(onSuccess: suspend (T) -> R, onError: (RailError) -> R): R {
		return when {
			isSuccess() -> onSuccess(get())
			else -> onError(getError())
		}
	}

}


class SuccessRail<T>(private val value: T) : Rail<T>() {

	override fun isError() = false

	override fun isError(error: String) = false

	override fun isSuccess() = true

	override fun get(): T {
		return value
	}

	override fun getOrDefault(default: T): T {
		return value
	}

	override fun getError(): RailError {
		throw IllegalStateException("Success-rail does not have an error message.")
	}

}


class ErrorRail<T>(private val error: RailError) : Rail<T>() {

	override fun isError() = true

	override fun isError(error: String) = getError().message == error

	override fun isSuccess() = false

	override fun get(): T {
		throw IllegalStateException("Error-rail does not have a result.")
	}

	override fun getOrDefault(default: T): T {
		return default
	}

	override fun getError(): RailError {
		return error
	}

}


data class RailError(
	val message: String,
	val exception: Throwable? = null
)