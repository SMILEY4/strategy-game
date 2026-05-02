package io.github.smiley4.strategygame.identity.shared

import io.github.smiley4.strategygame.identity.user.UserError
import kotlinx.serialization.Serializable

/**
 * Unsafe raw password.
 */
@JvmInline
@Serializable
value class UnsafePassword(val value: String) {
    init {
        if (value.isBlank()) throw UserError.UnsafePasswordError.Empty()
    }
}
