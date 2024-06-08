package io.github.smiley4.strategygame.backend.users.ports.provided

import io.github.smiley4.strategygame.backend.users.ports.models.AuthData

interface RefreshUserToken {

    sealed class RefreshTokenError : Exception()


    /**
     * The given credentials are not valid, i.e. the user is not authorized
     */
    class NotAuthorizedError : RefreshTokenError()


    /**
     * The user has not confirmed the account yet
     */
    class UserNotConfirmedError : RefreshTokenError()


    /**
     * No user with the given data exists
     */
    class UserNotFoundError : RefreshTokenError()


    /**
     * Provides a new authentication token using the given refresh token
     * @return the new valid token
     * @throws RefreshTokenError
     */
    fun perform(refreshToken: String): AuthData

}