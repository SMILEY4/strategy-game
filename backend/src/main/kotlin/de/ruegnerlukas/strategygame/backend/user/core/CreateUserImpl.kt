package de.ruegnerlukas.strategygame.backend.user.core

import de.ruegnerlukas.strategygame.backend.user.ports.provided.CreateUser
import de.ruegnerlukas.strategygame.backend.user.ports.provided.CreateUser.CodeDeliveryError
import de.ruegnerlukas.strategygame.backend.user.ports.provided.CreateUser.InvalidEmailOrPasswordError
import de.ruegnerlukas.strategygame.backend.user.ports.provided.CreateUser.UserAlreadyExistsError
import de.ruegnerlukas.strategygame.backend.user.ports.required.UserIdentityService

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