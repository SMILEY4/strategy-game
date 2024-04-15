package de.ruegnerlukas.strategygame.backend.user.core

import de.ruegnerlukas.strategygame.backend.user.ports.provided.DeleteUser
import de.ruegnerlukas.strategygame.backend.user.ports.provided.DeleteUser.*
import de.ruegnerlukas.strategygame.backend.user.ports.required.UserIdentityService

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