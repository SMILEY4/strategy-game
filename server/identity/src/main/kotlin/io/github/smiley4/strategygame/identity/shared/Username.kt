package io.github.smiley4.strategygame.identity.shared

import kotlinx.serialization.Serializable

/**
 * Name of a user.
 */
@JvmInline
@Serializable
value class Username(val value: String) {
    init {
        if (value.isBlank()) throw UsernameError.Empty()
        if (!value.matches(Regex("^[a-zA-Z0-9]+$"))) throw UsernameError.InvalidSymbols(value)
    }
}

sealed class UsernameError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class Empty : UnsafePasswordError("Username cannot be empty")
    class InvalidSymbols(username: String) : UnsafePasswordError("Username $username contains invalid symbols")
}