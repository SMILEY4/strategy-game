package de.ruegnerlukas.strategygame.backend.core.actions.user

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserCreateAction
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService

class UserCreateActionImpl(private val userIdentity: UserIdentityService) : UserCreateAction {

    override fun perform(email: String, password: String, username: String): Either<UserCreateAction.UserCreateActionError, Unit> {
        return when (val result = userIdentity.createUser(email, password, username)) {
            is Either.Right -> Unit.right()
            is Either.Left -> when (result.value) {
                UserIdentityService.CodeDeliveryError -> UserCreateAction.CodeDeliveryError.left()
                UserIdentityService.InvalidEmailOrPasswordError -> UserCreateAction.InvalidEmailOrPasswordError.left()
                UserIdentityService.UserAlreadyExistsError -> UserCreateAction.UserAlreadyExistsError.left()
            }
        }
    }

}