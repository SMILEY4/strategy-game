package io.github.smiley4.strategygame.backend.users.edge

import io.github.smiley4.strategygame.backend.users.edge.models.AuthData

interface RefreshUserToken {

    sealed class RefreshTokenError(message: String? = null, cause: Throwable? = null) : Exception(message, cause)
    class NotAuthorizedError(cause: Throwable? = null) : RefreshTokenError("The given credentials are not valid, i.e. the user is not authorized", cause)
    class UserNotConfirmedError(cause: Throwable? = null) : RefreshTokenError("The user has not confirmed the account yet", cause)
    class UserNotFoundError(cause: Throwable? = null) : RefreshTokenError("No user with the given data exists", cause)

    /**
     * Checks the given refresh token and returns a new valid auth token
     */
    fun perform(refreshToken: String): AuthData

}