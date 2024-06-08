package io.github.smiley4.strategygame.backend.users.core

import io.github.smiley4.strategygame.backend.users.ports.models.AuthData
import io.github.smiley4.strategygame.backend.users.ports.provided.RefreshUserToken
import io.github.smiley4.strategygame.backend.users.ports.provided.RefreshUserToken.*
import io.github.smiley4.strategygame.backend.users.ports.required.UserIdentityService

class RefreshUserTokenImpl(private val userIdentity: UserIdentityService) : RefreshUserToken {

    override fun perform(refreshToken: String): AuthData {
        try {
            return userIdentity.refreshAuthentication(refreshToken)
        } catch (e: UserIdentityService.UserIdentityError) {
            when (e) {
                is UserIdentityService.NotAuthorizedError -> throw NotAuthorizedError()
                is UserIdentityService.UserNotConfirmedError -> throw UserNotConfirmedError()
                is UserIdentityService.UserNotFoundError -> throw UserNotFoundError()
                else -> throw Exception("Token could not be refreshed", e)
            }
        }
    }

}