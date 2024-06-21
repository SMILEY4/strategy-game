package io.github.smiley4.strategygame.backend.users.module.core

import io.github.smiley4.strategygame.backend.users.module.iam.UserIdentityService


class LoginUser(private val userIdentity: UserIdentityService) {

    sealed class LoginUserError : Exception()


    /**
     * The given credentials are not valid, i.e. the user is not authorized
     */
    class NotAuthorizedError : LoginUserError()


    /**
     * The user has not confirmed the account yet
     */
    class UserNotConfirmedError : LoginUserError()


    /**
     * No user with the given data exists
     */
    class UserNotFoundError : LoginUserError()


    fun perform(email: String, password: String): AuthDataExtended {
        try {
            return userIdentity.authenticate(email, password)
        } catch (e: UserIdentityService.UserIdentityError) {
            when (e) {
                is UserIdentityService.NotAuthorizedError -> throw UserIdentityService.NotAuthorizedError()
                is UserIdentityService.UserNotConfirmedError -> throw UserIdentityService.UserNotConfirmedError()
                is UserIdentityService.UserNotFoundError -> throw UserIdentityService.UserNotFoundError()
                else -> throw Exception("User could not be authenticated", e)
            }
        }
    }

}