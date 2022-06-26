package de.ruegnerlukas.strategygame.backend.shared.either

import mu.KotlinLogging

/**
 * Represents either a successful ([Ok]) or a failed ([Err]) result
 */
sealed class Either<out V, out E> {

	companion object {

		/**
		 * Whether to log all errors of [Err]
		 */
		var logErrors: Boolean = false


		/**
		 * Start with an empty [Ok]
		 */
		fun start() = Ok()


		/**
		 * Return the result of the [block] as an [Ok]
		 */
		suspend fun <V> run(block: suspend () -> V) = Ok(block())


		/**
		 * Return the result of the [block] as an [Ok]. If an exception was throw, return it asn an [Err]
		 */
		suspend fun <V> runCatching(block: suspend () -> V): Either<V, Throwable> {
			try {
				return Ok(block())
			} catch (e: Throwable) {
				return Err(e)
			}
		}
	}


	/**
	 * Whether this [Either] represents a failed result
	 */
	fun isError() = this is Err


	/**
	 * Whether this [Either] represents a failed result with the given error
	 */
	fun <E> isError(expected: E) = this is Err && this.error == expected


	/**
	 * Whether this [Either] represents a successful result
	 */
	fun isOk() = this is Ok
}


/**
 * Represents a successful result with the given value
 */
class Ok<V>(val value: V) : Either<V, Nothing>() {
	companion object {
		operator fun invoke() = Ok(Unit)
	}
}


/**
 * Represents a failed result with the given error
 */
class Err<E>(val error: E) : Either<Nothing, E>() {
	init {
		if (logErrors) {
			if (error is Throwable) {
				KotlinLogging.logger {}.warn("Either encountered error", error)
			} else {
				KotlinLogging.logger {}.warn("Either encountered error: $error")
			}
		}
	}
}


/**
 * Run the given [action] with the current value if this is an [Ok]. Return the same [Either].
 */
suspend fun <V, E> Either<V, E>.then(action: suspend (V) -> Unit): Either<V, E> {
	return when (this) {
		is Ok -> {
			action(value)
			this
		}
		is Err -> this
	}
}


/**
 * Run the given [action] with the current value if this is an [Ok]. Return the same [Either].
 * If the transformation throws any exception, an [Err] is returned with the content of the [transformException]
 */
suspend fun <V, E> Either<V, E>.thenCatching(action: suspend (V) -> Unit, transformException: (e: Exception) -> E): Either<V, E> {
	try {
		return when (this) {
			is Ok -> {
				action(value)
				this
			}
			is Err -> this
		}
	} catch (e: Exception) {
		return Err(transformException(e))
	}
}


/**
 * Run the given [action] with the current value if this is an [Ok]. Return the same [Either].
 * If the transformation throws any exception, an [Err] is returned with the given error
 */
suspend fun <V, E> Either<V, E>.thenCatching(action: suspend (V) -> Unit, error: E): Either<V, E> {
	return thenCatching(action) { error }
}


/**
 * Run the given [action] with the current value if this is an [Ok]. Return the same [Err] if this is an [Err]. If the result of the action is an [Err], return that.
 */
suspend fun <V, E> Either<V, E>.thenOrErr(action: suspend (V) -> Either<*, E>): Either<V, E> {
	return when (this) {
		is Ok -> {
			when (val result = action(value)) {
				is Ok -> this
				is Err -> result
			}
		}
		is Err -> this
	}
}


/**
 * Run the given [action] with the current value if this is an [Ok]. Return the same [Err] if this is an [Err]. If the result of the action is an [Err], return that.
 * If the transformation throws any exception, an [Err] is returned with the content of the [transformException]
 */
suspend fun <V, E> Either<V, E>.thenOrErrCatching(
	action: suspend (V) -> Either<*, E>,
	transformException: (e: Exception) -> E
): Either<V, E> {
	try {
		return when (this) {
			is Ok -> {
				when (val result = action(value)) {
					is Ok -> this
					is Err -> result
				}
			}
			is Err -> this
		}
	} catch (e: Exception) {
		return Err(transformException(e))
	}
}


/**
 * Run the given [action] with the current value if this is an [Ok]. Return the same [Err] if this is an [Err]. If the result of the action is an [Err], return that.
 *  If the transformation throws any exception, an [Err] is returned with the given error
 */
suspend fun <V, E> Either<V, E>.thenOrErrCatching(action: suspend (V) -> Either<*, E>, error: E): Either<V, E> {
	return thenOrErrCatching(action) { error }
}


/**
 * Maps this [Either] to a new [Either] by applying the given transform with the current value if this is a [Ok] or by returning this [Err]
 */
suspend fun <V, E, T> Either<V, E>.map(transform: suspend (V) -> T): Either<T, E> {
	return when (this) {
		is Ok -> Ok(transform(value))
		is Err -> this
	}
}


/**
 * Maps this [Either] to a new [Either] by applying the given [transform] with the current value if this is a [Ok] or by returning this [Err].
 * If the transformation throws any exception, an [Err] is returned with the content of the [transformException]
 */
suspend fun <V, E, T> Either<V, E>.mapCatching(
	transform: suspend (V) -> T,
	transformException: (e: Exception) -> E
): Either<T, E> {
	try {
		return when (this) {
			is Ok -> Ok(transform(value))
			is Err -> this
		}
	} catch (e: Exception) {
		return Err(transformException(e))
	}
}


/**
 * Maps this [Either] to a new [Either] by applying the given [transform] with the current value if this is a [Ok] or by returning this [Err].
 * If the transformation throws any exception, an [Err] is returned with the given error
 */
suspend fun <V, E, T> Either<V, E>.mapCatching(transform: suspend (V) -> T, error: E): Either<T, E> {
	return mapCatching(transform) { error }
}


/**
 * Maps this [Either] to a new [Either] by applying the given transform with the current value if this is a [Ok] or by returning this [Err].
 */
suspend fun <V, E, T> Either<V, E>.flatMap(transform: suspend (V) -> Either<T, E>): Either<T, E> {
	return when (this) {
		is Ok -> transform(value)
		is Err -> this
	}
}


/**
 * Maps this [Either] to a new [Either] by applying the given [transform] with the current value if this is a [Ok] or by returning this [Err].
 * If the transformation throws any exception, an [Err] is returned with the content of the [transformException]
 */
suspend fun <V, E, T> Either<V, E>.flatMapCatching(
	transform: suspend (V) -> Either<T, E>,
	transformException: (e: Exception) -> E
): Either<T, E> {
	try {
		return when (this) {
			is Ok -> transform(value)
			is Err -> this
		}
	} catch (e: Exception) {
		return Err(transformException(e))
	}
}


/**
 * Maps this [Either] to a new [Either] by applying the given transform with the current error if this is an [Err] or by returning this [Ok]
 */
suspend fun <V, E, T> Either<V, E>.mapError(transform: suspend (E) -> T): Either<V, T> {
	return when (this) {
		is Ok -> this
		is Err -> Err(transform(error))
	}
}


/**
 * Maps this [Either] to a new [Either] by applying the given transform with the current error if this is an [Err] or by returning this [Ok]
 */
suspend fun <V, E, T : E> Either<V, E>.mapError(expectedError: E, transform: suspend (E) -> T): Either<V, E> {
	return when (this) {
		is Ok -> this
		is Err -> {
			return if (error == expectedError) {
				Err(transform(error))
			} else {
				this
			}
		}
	}
}


/**
 * Maps this [Either] to a new [Either] by applying the given transform with the current error if this is an [Err] or by returning this [Ok]
 */
suspend fun <V, E> Either<V, E>.recover(transform: suspend (E) -> V): Ok<V> {
	return when (this) {
		is Ok -> this
		is Err -> Ok(transform(error))
	}
}


/**
 * Maps this [Either] to a new [Either] by applying the given transform with the current error if this is an [Err] equalling the given [expectedError] or by returning this [Ok]
 */
suspend fun <V, E> Either<V, E>.recover(expectedError: E, transform: suspend (E) -> V): Either<V, E> {
	return when (this) {
		is Ok -> this
		is Err -> {
			return if (error == expectedError) {
				Ok(transform(error))
			} else {
				this
			}
		}
	}
}


/**
 * Maps this [Either] to a new [Either] mapping the current value to [Unit] if this is a [Ok] or by returning this [Err]
 */
fun <V, E> Either<V, E>.discardValue(): Either<Unit, E> {
	return when (this) {
		is Ok -> Ok(Unit)
		is Err -> this
	}
}


/**
 * Map this [Either] to a single value by either applying [onSuccess] with the current value if this is a [Ok] or [onError] with the current error if this is an [Err]
 */
suspend fun <V, E, T> Either<V, E>.fold(onSuccess: suspend (V) -> T, onError: suspend (E) -> T): T {
	return when (this) {
		is Ok -> onSuccess(value)
		is Err -> onError(error)
	}
}


/**
 * Map this [Either] to a single new [Either] by either applying [onSuccess] with the current value if this is a [Ok] or [onError] with the current error if this is an [Err]
 */
suspend fun <V, E, TV, TE> Either<V, E>.foldFlat(
	onSuccess: suspend (V) -> Either<TV, TE>,
	onError: suspend (E) -> Either<TV, TE>
): Either<TV, TE> {
	return when (this) {
		is Ok -> onSuccess(value)
		is Err -> onError(error)
	}
}


/**
 * Call [handler] with the current value if this is a [Ok] and return this [Either]
 */
suspend fun <V, E> Either<V, E>.onSuccess(handler: suspend (V) -> Unit): Either<V, E> {
	if (this is Ok) {
		handler(value)
	}
	return this
}


/**
 * Call [handler] with the current error if this is an [Err] and return this [Either]
 */
suspend fun <V, E> Either<V, E>.onError(handler: suspend (E) -> Unit): Either<V, E> {
	if (this is Err) {
		handler(error)
	}
	return this
}


/**
 * Call [handler] with the current error if this is an [Err] and the current error equals the given [expectedError]. Return this [Either]
 */
suspend fun <V, E> Either<V, E>.onError(expectedError: E, handler: suspend (E) -> Unit): Either<V, E> {
	if (this is Err && error == expectedError) {
		handler(error)
	}
	return this
}


/**
 * Call either [onSuccess] with the current value if this is a [Ok] or call [onError] with the current error if this is an [Err]. Return this [Either]
 */
suspend fun <V, E> Either<V, E>.on(onSuccess: suspend (V) -> Unit, onError: suspend (E) -> Unit): Either<V, E> {
	return when (this) {
		is Ok -> {
			onSuccess(value)
			this
		}
		is Err -> {
			onError(error)
			this
		}
	}
}


/**
 * @return the current value if this is a [Ok] or 'null' if this is an [Err]
 */
fun <V, E> Either<V, E>.get(): V? {
	return when (this) {
		is Ok -> value
		is Err -> null
	}
}


/**
 * @return the current value if this is a [Ok] or the given default value if this is an [Err]
 */
fun <V, E> Either<V, E>.getOr(defaultValue: V): V {
	return when (this) {
		is Ok -> value
		is Err -> defaultValue
	}
}


/**
 * @return the current value if this is a [Ok] or throw the given [Throwable] if this is an [Err]
 */
fun <V, E> Either<V, E>.getOrThrow(throwable: Throwable): V {
	return when (this) {
		is Ok -> value
		is Err -> throw throwable
	}
}


/**
 * @return the current value if this is a [Ok] or throw an [IllegalStateException] or the error-value if its a [Throwable]
 */
fun <V, E> Either<V, E>.getOrThrow(): V {
	return when (this) {
		is Ok -> value
		is Err -> {
			when (error) {
				is Throwable -> throw error
				else -> throw IllegalStateException("Cannot get value of Err!")
			}
		}
	}
}


/**
 * @return the current error if this is an [Err] 'null' if this is a [Ok]
 */
fun <V, E> Either<V, E>.getError(): E? {
	return when (this) {
		is Ok -> null
		is Err -> error
	}
}