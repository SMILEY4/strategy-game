package io.github.smiley4.strategygame.backend.users.refreshtoken

internal sealed class UserRefreshTokenError(message: String, cause: Throwable? = null) : Exception(message, cause) {
    class NotAuthorizedError(cause: Throwable? = null) : UserRefreshTokenError("The given credentials are not valid", cause)
    class UserNotConfirmedError(cause: Throwable? = null) : UserRefreshTokenError("The user has not confirmed the account yet", cause)
    class UserNotFoundError(cause: Throwable? = null) : UserRefreshTokenError("No user with the given data exists", cause)
}