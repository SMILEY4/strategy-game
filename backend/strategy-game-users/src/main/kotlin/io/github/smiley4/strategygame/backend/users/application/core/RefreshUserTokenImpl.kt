package io.github.smiley4.strategygame.backend.users.application.core

import io.github.smiley4.strategygame.backend.users.ports.provided.RefreshUserToken
import io.github.smiley4.strategygame.backend.users.ports.AuthData
import io.github.smiley4.strategygame.backend.users.ports.required.UserIdentityService


internal class RefreshUserTokenImpl(private val userIdentity: UserIdentityService) : RefreshUserToken {

    override fun perform(refreshToken: String): AuthData {
        try {
            return userIdentity.refreshAuthentication(refreshToken)
        } catch (e: UserIdentityService.UserIdentityError) {
            when (e) {
                is UserIdentityService.NotAuthorizedError -> throw RefreshUserToken.NotAuthorizedError(e)
                is UserIdentityService.UserNotConfirmedError -> throw RefreshUserToken.UserNotConfirmedError(e)
                is UserIdentityService.UserNotFoundError -> throw RefreshUserToken.UserNotFoundError(e)
                else -> throw Exception("Token could not be refreshed", e)
            }
        }
    }

}