package io.github.smiley4.strategygame.backend.users.login

import io.github.smiley4.strategygame.backend.users.AuthDataExtended
import io.github.smiley4.strategygame.backend.users.authentication.UserIdentityService

internal class UserLogin(
    private val userIdentity: UserIdentityService
) {

    fun login(email: String, password: String): AuthDataExtended {
        try {
            return userIdentity.authenticate(email, password)
        } catch (e: UserIdentityService.UserIdentityError) {
            when (e) {
                is UserIdentityService.NotAuthorizedError -> throw UserLoginError.NotAuthorizedError(e)
                is UserIdentityService.UserNotConfirmedError -> throw UserLoginError.UserNotConfirmedError(e)
                is UserIdentityService.UserNotFoundError -> throw UserLoginError.UserNotFoundError(e)
                else -> throw Exception("User could not be authenticated", e)
            }
        }
    }

}