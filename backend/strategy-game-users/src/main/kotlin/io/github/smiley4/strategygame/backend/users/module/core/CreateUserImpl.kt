package io.github.smiley4.strategygame.backend.users.module.core

import io.github.smiley4.strategygame.backend.users.edge.CreateUser
import io.github.smiley4.strategygame.backend.users.module.iam.UserIdentityService


internal class CreateUserImpl(private val userIdentity: UserIdentityService): CreateUser {

    override fun perform(email: String, password: String, username: String) {
        try {
            userIdentity.createUser(email, password, username)
        } catch (e: UserIdentityService.UserIdentityError) {
            when (e) {
                is UserIdentityService.CodeDeliveryError -> throw CreateUser.CodeDeliveryError(e)
                is UserIdentityService.InvalidEmailOrPasswordError -> throw CreateUser.InvalidEmailOrPasswordError(e)
                is UserIdentityService.UserAlreadyExistsError -> throw CreateUser.UserAlreadyExistsError(e)
                else -> throw Exception("Could not create user", e)
            }
        }
    }

}