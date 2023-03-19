package de.ruegnerlukas.strategygame.backend.core.actions.user

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.AuthDataExtended
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserLoginAction
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService

class UserLoginActionImpl(private val userIdentity: UserIdentityService) : UserLoginAction {

    override fun perform(email: String, password: String): Either<UserLoginAction.UserLoginActionError, AuthDataExtended> {
        return when (val result = userIdentity.authenticate(email, password)) {
            is Either.Right -> result.value.right()
            is Either.Left -> when (result.value) {
                UserIdentityService.NotAuthorizedError -> UserLoginAction.NotAuthorizedError.left()
                UserIdentityService.UserNotConfirmedError -> UserLoginAction.UserNotConfirmedError.left()
                UserIdentityService.UserNotFoundError -> UserLoginAction.UserNotFoundError.left()
            }
        }
    }

}