package io.github.smiley4.strategygame.backend.users.module.core

import io.github.smiley4.strategygame.backend.users.edge.LoginUser
import io.github.smiley4.strategygame.backend.users.edge.models.AuthDataExtended
import io.github.smiley4.strategygame.backend.users.module.iam.UserIdentityService


internal class LoginUserImpl(private val userIdentity: UserIdentityService): LoginUser {

    override fun perform(email: String, password: String): AuthDataExtended {
        try {
            return userIdentity.authenticate(email, password)
        } catch (e: UserIdentityService.UserIdentityError) {
            when (e) {
                is UserIdentityService.NotAuthorizedError -> throw LoginUser.NotAuthorizedError()
                is UserIdentityService.UserNotConfirmedError -> throw LoginUser.UserNotConfirmedError()
                is UserIdentityService.UserNotFoundError -> throw LoginUser.UserNotFoundError()
                else -> throw Exception("User could not be authenticated", e)
            }
        }
    }

}