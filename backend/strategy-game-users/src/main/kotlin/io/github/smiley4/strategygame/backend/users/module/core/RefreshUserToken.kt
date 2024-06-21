package io.github.smiley4.strategygame.backend.users.module.core

import io.github.smiley4.strategygame.backend.users.module.iam.UserIdentityService


class RefreshUserToken(private val userIdentity: UserIdentityService) {

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


    fun perform(refreshToken: String): AuthData {
        try {
            return userIdentity.refreshAuthentication(refreshToken)
        } catch (e: UserIdentityService.UserIdentityError) {
            when (e) {
                is UserIdentityService.NotAuthorizedError -> throw UserIdentityService.NotAuthorizedError()
                is UserIdentityService.UserNotConfirmedError -> throw UserIdentityService.UserNotConfirmedError()
                is UserIdentityService.UserNotFoundError -> throw UserIdentityService.UserNotFoundError()
                else -> throw Exception("Token could not be refreshed", e)
            }
        }
    }

}