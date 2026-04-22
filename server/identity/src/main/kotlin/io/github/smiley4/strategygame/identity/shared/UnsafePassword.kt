package io.github.smiley4.strategygame.identity.shared

import io.github.smiley4.strategygame.identity.user.UserError

/**
 * Unsafe raw password.
 */
@JvmInline
value class UnsafePassword(val value: String) {
    init {
        if (value.isBlank()) throw UserError.UnsafePasswordError.Empty()
    }
}
