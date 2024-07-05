package io.github.smiley4.strategygame.backend.users.module.core

import io.github.smiley4.strategygame.backend.users.edge.DeleteUser
import io.github.smiley4.strategygame.backend.users.edge.UserIdentityService


internal class DeleteUserImpl(private val userIdentity: UserIdentityService): DeleteUser {

    override fun perform(email: String, password: String) {
        try {
            userIdentity.deleteUser(email, password)
        } catch (e: UserIdentityService.UserIdentityError) {
            when (e) {
                is UserIdentityService.NotAuthorizedError -> throw DeleteUser.NotAuthorizedError(e)
                is UserIdentityService.UserNotConfirmedError -> throw DeleteUser.UserNotConfirmedError(e)
                is UserIdentityService.UserNotFoundError -> throw DeleteUser.UserNotFoundError(e)
                else -> throw Exception("Could not delete user", e)
            }
        }
    }

}