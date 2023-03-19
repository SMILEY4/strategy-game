package de.ruegnerlukas.strategygame.backend.core.actions.user

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserDeleteAction
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService

class UserDeleteActionImpl(private val userIdentity: UserIdentityService) : UserDeleteAction {

    override suspend fun perform(email: String, password: String): Either<UserDeleteAction.DeleteUserActionError, Unit> {
        return when (val result = userIdentity.deleteUser(email, password)) {
            is Either.Right -> Unit.right()
            is Either.Left -> when (result.value) {
                UserIdentityService.NotAuthorizedError -> UserDeleteAction.NotAuthorizedError.left()
            }
        }
    }

}