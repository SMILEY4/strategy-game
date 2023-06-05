package de.ruegnerlukas.strategygame.backend.user.core

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.Err
import de.ruegnerlukas.strategygame.backend.common.Ok
import de.ruegnerlukas.strategygame.backend.common.err
import de.ruegnerlukas.strategygame.backend.common.ok
import de.ruegnerlukas.strategygame.backend.user.ports.models.AuthData
import de.ruegnerlukas.strategygame.backend.user.ports.provided.RefreshUserToken
import de.ruegnerlukas.strategygame.backend.user.ports.provided.RefreshUserToken.NotAuthorizedError
import de.ruegnerlukas.strategygame.backend.user.ports.provided.RefreshUserToken.RefreshTokenError
import de.ruegnerlukas.strategygame.backend.user.ports.provided.RefreshUserToken.UserNotConfirmedError
import de.ruegnerlukas.strategygame.backend.user.ports.provided.RefreshUserToken.UserNotFoundError
import de.ruegnerlukas.strategygame.backend.user.ports.required.UserIdentityService

class RefreshUserTokenImpl(private val userIdentity: UserIdentityService) : RefreshUserToken {

    override fun perform(refreshToken: String): Either<RefreshTokenError, AuthData> {
        return when (val result = userIdentity.refreshAuthentication(refreshToken)) {
            is Ok -> result.value.ok()
            is Err -> when (result.value) {
                UserIdentityService.NotAuthorizedError -> NotAuthorizedError.err()
                UserIdentityService.UserNotConfirmedError -> UserNotConfirmedError.err()
                UserIdentityService.UserNotFoundError -> UserNotFoundError.err()
            }
        }
    }

}