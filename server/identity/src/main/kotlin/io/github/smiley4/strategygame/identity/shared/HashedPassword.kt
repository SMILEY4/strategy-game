package io.github.smiley4.strategygame.identity.shared

/**
 * A secure hashed password
 */
internal data class HashedPassword(val hash: String, val salt: String) {
    init {
        if (!hash.startsWith("$")) throw IllegalArgumentException("Attempted to store an unhashed password. Hash must start with '$'")
        if (salt.isBlank()) throw IllegalArgumentException("Salt must not be empty")
    }
}