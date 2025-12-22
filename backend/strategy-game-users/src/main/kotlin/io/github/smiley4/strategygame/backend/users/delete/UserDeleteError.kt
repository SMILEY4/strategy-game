package io.github.smiley4.strategygame.backend.users.delete

sealed class UserDeleteError(message: String, cause: Throwable? = null) : Exception(message, cause) {
    class NotAuthorizedError(cause: Throwable? = null) : UserDeleteError("The given credentials are not valid", cause)
    class UserNotConfirmedError(cause: Throwable? = null) : UserDeleteError("The user has not confirmed the account yet", cause)
    class UserNotFoundError(cause: Throwable? = null) : UserDeleteError("No user with the given data exists", cause)
}