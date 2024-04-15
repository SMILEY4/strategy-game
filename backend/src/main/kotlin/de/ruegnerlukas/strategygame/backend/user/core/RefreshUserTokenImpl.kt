package de.ruegnerlukas.strategygame.backend.user.core

import de.ruegnerlukas.strategygame.backend.user.ports.models.AuthData
import de.ruegnerlukas.strategygame.backend.user.ports.provided.RefreshUserToken
import de.ruegnerlukas.strategygame.backend.user.ports.provided.RefreshUserToken.*
import de.ruegnerlukas.strategygame.backend.user.ports.required.UserIdentityService

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