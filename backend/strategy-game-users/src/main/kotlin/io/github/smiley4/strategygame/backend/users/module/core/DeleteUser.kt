package io.github.smiley4.strategygame.backend.users.module.core

import io.github.smiley4.strategygame.backend.users.module.iam.UserIdentityService


class DeleteUser(private val userIdentity: UserIdentityService) {

    sealed class DeleteUserError : Exception()


    /**
     * The given credentials are not valid, i.e. the user is not authorized
     */
    class NotAuthorizedError : DeleteUserError()


    /**
     * The user has not confirmed the account yet
     */
    class UserNotConfirmedError : DeleteUserError()


    /**
     * No user with the given data exists
     */
    class UserNotFoundError : DeleteUserError()


    suspend fun perform(email: String, password: String) {
        try {
            userIdentity.deleteUser(email, password)
        } catch (e: UserIdentityService.UserIdentityError) {
            when (e) {
                is UserIdentityService.NotAuthorizedError -> throw UserIdentityService.NotAuthorizedError()
                is UserIdentityService.UserNotConfirmedError -> throw UserIdentityService.UserNotConfirmedError()
                is UserIdentityService.UserNotFoundError -> throw UserIdentityService.UserNotFoundError()
                else -> throw Exception("Could not delete user", e)
            }
        }
    }

}