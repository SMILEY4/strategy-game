package io.github.smiley4.strategygame.identity.user

import io.github.smiley4.strategygame.identity.user.domain.UserId
import io.github.smiley4.strategygame.identity.user.domain.Username

/**
 * Errors for the user domain.
 */
sealed class UserError(message: String?, cause: Throwable?) : Exception(message, cause) {

    sealed class UsernameError(message: String?, cause: Throwable?) : UserError(message, cause) {
        class Empty : UsernameError("Username cannot be empty", null)
        class Invalid(value: String) : UsernameError("Only alphanumeric allowed. Actual: '$value'", null)
    }

    sealed class UnsafePasswordError(message: String?, cause: Throwable?) : UserError(message, cause) {
        class Empty : UsernameError("Username cannot be empty", null)
    }

    class UsernameNotUnique(username: Username) : UsernameError("A user with the name '${username.value}' already exists'", null)

    class NotFound(value: UserId) : UserError("User with id '${value.id}' could not be found", null)

}