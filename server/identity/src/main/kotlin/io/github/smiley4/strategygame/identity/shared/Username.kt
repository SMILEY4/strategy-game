package io.github.smiley4.strategygame.identity.shared

import io.github.smiley4.strategygame.identity.user.UserError

/**
 * Name of a user.
 */
@JvmInline
value class Username(val value: String) {
    init {
        if(value.isBlank()) throw UserError.UsernameError.Empty()
        if(!value.matches(Regex("^[a-zA-Z0-9]+$"))) throw UserError.UsernameError.Invalid(value)
    }
}
