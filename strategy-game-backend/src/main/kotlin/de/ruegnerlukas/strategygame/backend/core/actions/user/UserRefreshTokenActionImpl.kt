package de.ruegnerlukas.strategygame.backend.core.actions.user

import arrow.core.Either
import arrow.core.left
import arrow.core.right
import de.ruegnerlukas.strategygame.backend.ports.models.auth.AuthData
import de.ruegnerlukas.strategygame.backend.ports.provided.user.UserRefreshTokenAction
import de.ruegnerlukas.strategygame.backend.ports.required.UserIdentityService

class UserRefreshTokenActionImpl(private val userIdentity: UserIdentityService) : UserRefreshTokenAction {

    override fun perform(refreshToken: String): Either<UserRefreshTokenAction.UserRefreshTokenActionError, AuthData> {
        return when (val result = userIdentity.refreshAuthentication(refreshToken)) {
            is Either.Right -> result.value.right()
            is Either.Left -> when (result.value) {
                UserIdentityService.NotAuthorizedError -> UserRefreshTokenAction.NotAuthorizedError.left()
                UserIdentityService.UserNotConfirmedError -> UserRefreshTokenAction.UserNotConfirmedError.left()
                UserIdentityService.UserNotFoundError -> UserRefreshTokenAction.UserNotFoundError.left()
            }
        }
    }

}