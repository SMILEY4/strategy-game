package io.github.smiley4.strategygame.backend.users.refreshtoken

import io.github.smiley4.strategygame.backend.users.AuthData
import io.github.smiley4.strategygame.backend.users.authentication.UserIdentityService

class UserRefreshToken(
    private val userIdentity: UserIdentityService
) {

    fun refreshToken(refreshToken: String): AuthData {
        try {
            return userIdentity.refreshAuthentication(refreshToken)
        } catch (e: UserIdentityService.UserIdentityError) {
            when (e) {
                is UserIdentityService.NotAuthorizedError -> throw UserRefreshTokenError.NotAuthorizedError(e)
                is UserIdentityService.UserNotConfirmedError -> throw UserRefreshTokenError.UserNotConfirmedError(e)
                is UserIdentityService.UserNotFoundError -> throw UserRefreshTokenError.UserNotFoundError(e)
                else -> throw Exception("Token could not be refreshed", e)
            }
        }
    }

}