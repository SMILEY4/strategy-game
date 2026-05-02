package io.github.smiley4.strategygame.identity.shared

/**
 * A secure hashed password
 */
internal data class HashedPassword(val hash: String, val salt: String) {
    init {
        if (!hash.startsWith("$")) throw HashedPasswordError.Unhashed()
        if (salt.isBlank()) throw HashedPasswordError.EmptySalt()
    }
}

sealed class HashedPasswordError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class EmptySalt : HashedPasswordError("Salt must not be empty")
    class Unhashed : HashedPasswordError("Attempted to create an unhashed password. Hash must start with '$'")
}