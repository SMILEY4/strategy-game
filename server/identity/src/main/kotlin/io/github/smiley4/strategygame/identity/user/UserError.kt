package io.github.smiley4.strategygame.identity.user

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

    class UsernameNotUnique(username: String) : UsernameError("A user with the name '${username}' already exists'", null)

    class NotFound(value: String) : UserError("User '${value}' could not be found", null)

}