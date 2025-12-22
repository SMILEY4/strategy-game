package io.github.smiley4.strategygame.backend.users.delete

import io.github.smiley4.strategygame.backend.users.authentication.UserIdentityService

class UserDelete(
    private val userIdentity: UserIdentityService
) {

    fun delete(email: String, password: String) {
        try {
            userIdentity.deleteUser(email, password)
        } catch (e: UserIdentityService.UserIdentityError) {
            when (e) {
                is UserIdentityService.NotAuthorizedError -> throw UserDeleteError.NotAuthorizedError(e)
                is UserIdentityService.UserNotConfirmedError -> throw UserDeleteError.UserNotConfirmedError(e)
                is UserIdentityService.UserNotFoundError -> throw UserDeleteError.UserNotFoundError(e)
                else -> throw Exception("Could not delete user", e)
            }
        }
    }

}