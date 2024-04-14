package de.ruegnerlukas.strategygame.backend.user.core

import de.ruegnerlukas.strategygame.backend.user.ports.models.AuthDataExtended
import de.ruegnerlukas.strategygame.backend.user.ports.provided.LoginUser
import de.ruegnerlukas.strategygame.backend.user.ports.provided.LoginUser.*
import de.ruegnerlukas.strategygame.backend.user.ports.required.UserIdentityService

class LoginUserImpl(private val userIdentity: UserIdentityService) : LoginUser {

    override fun perform(email: String, password: String): AuthDataExtended {
        try {
            return userIdentity.authenticate(email, password)
        } catch (e: UserIdentityService.UserIdentityError) {
            when (e) {
                is UserIdentityService.NotAuthorizedError -> throw NotAuthorizedError()
                is UserIdentityService.UserNotConfirmedError -> throw UserNotConfirmedError()
                is UserIdentityService.UserNotFoundError -> throw UserNotFoundError()
                else -> throw Exception("User could not be authenticated", e)
            }
        }
    }

}