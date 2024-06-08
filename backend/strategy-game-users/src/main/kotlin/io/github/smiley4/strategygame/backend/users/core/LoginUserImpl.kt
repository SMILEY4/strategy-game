package io.github.smiley4.strategygame.backend.users.core

import io.github.smiley4.strategygame.backend.users.ports.models.AuthDataExtended
import io.github.smiley4.strategygame.backend.users.ports.provided.LoginUser
import io.github.smiley4.strategygame.backend.users.ports.provided.LoginUser.*
import io.github.smiley4.strategygame.backend.users.ports.required.UserIdentityService

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