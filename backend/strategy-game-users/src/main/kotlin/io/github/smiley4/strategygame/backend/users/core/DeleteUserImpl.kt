package io.github.smiley4.strategygame.backend.users.core

import io.github.smiley4.strategygame.backend.users.ports.provided.DeleteUser
import io.github.smiley4.strategygame.backend.users.ports.provided.DeleteUser.*
import io.github.smiley4.strategygame.backend.users.ports.required.UserIdentityService

class DeleteUserImpl(private val userIdentity: UserIdentityService) : DeleteUser {

    override suspend fun perform(email: String, password: String) {
        try {
            userIdentity.deleteUser(email, password)
        } catch (e: UserIdentityService.UserIdentityError) {
            when (e) {
                is UserIdentityService.NotAuthorizedError -> throw NotAuthorizedError()
                is UserIdentityService.UserNotConfirmedError -> throw UserNotConfirmedError()
                is UserIdentityService.UserNotFoundError -> throw UserNotFoundError()
                else -> throw Exception("Could not delete user", e)
            }
        }
    }

}