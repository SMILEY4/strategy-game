package io.github.smiley4.strategygame.backend.users.core

import io.github.smiley4.strategygame.backend.users.ports.provided.CreateUser
import io.github.smiley4.strategygame.backend.users.ports.provided.CreateUser.CodeDeliveryError
import io.github.smiley4.strategygame.backend.users.ports.provided.CreateUser.InvalidEmailOrPasswordError
import io.github.smiley4.strategygame.backend.users.ports.provided.CreateUser.UserAlreadyExistsError
import io.github.smiley4.strategygame.backend.users.ports.required.UserIdentityService

class CreateUserImpl(private val userIdentity: UserIdentityService) : CreateUser {

    override fun perform(email: String, password: String, username: String) {
        try {
            userIdentity.createUser(email, password, username)
        } catch (e: UserIdentityService.UserIdentityError) {
            when(e)  {
                is UserIdentityService.CodeDeliveryError -> throw CodeDeliveryError()
                is UserIdentityService.InvalidEmailOrPasswordError -> throw InvalidEmailOrPasswordError()
                is UserIdentityService.UserAlreadyExistsError -> throw UserAlreadyExistsError()
                else -> throw Exception("Could not create user", e)
            }
        }
    }

}