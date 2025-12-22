package io.github.smiley4.strategygame.backend.users.login

sealed class UserLoginError(message: String, cause: Throwable? = null) : Exception(message, cause) {
    class NotAuthorizedError(cause: Throwable? = null) : UserLoginError("The given credentials are not valid", cause)
    class UserNotConfirmedError(cause: Throwable? = null) : UserLoginError("The user has not confirmed the account yet", cause)
    class UserNotFoundError(cause: Throwable? = null) : UserLoginError("No user with the given data exists", cause)
}