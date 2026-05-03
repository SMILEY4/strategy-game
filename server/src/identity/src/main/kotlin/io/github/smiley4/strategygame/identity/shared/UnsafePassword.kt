package io.github.smiley4.strategygame.identity.shared

import kotlinx.serialization.Serializable

/**
 * Unsafe raw password.
 */
@JvmInline
@Serializable
value class UnsafePassword(val value: String) {

    init {
        if (value.isBlank()) throw UnsafePasswordError.Empty()
    }

}

sealed class UnsafePasswordError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class Empty : UnsafePasswordError("Password cannot be empty")
}