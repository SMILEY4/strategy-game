package io.github.smiley4.strategygame.backend.users.edge

import io.github.smiley4.strategygame.backend.users.edge.models.AuthData

interface RefreshUserToken {

    sealed class RefreshTokenError(message: String? = null) : Exception(message)
    class NotAuthorizedError : RefreshTokenError("The given credentials are not valid, i.e. the user is not authorized")
    class UserNotConfirmedError : RefreshTokenError("The user has not confirmed the account yet")
    class UserNotFoundError : RefreshTokenError("No user with the given data exists")

    /**
     * Checks the given refresh token and returns a new valid auth token
     */
    fun perform(refreshToken: String): AuthData

}