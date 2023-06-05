package de.ruegnerlukas.strategygame.backend.user.core

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.Err
import de.ruegnerlukas.strategygame.backend.common.Ok
import de.ruegnerlukas.strategygame.backend.common.err
import de.ruegnerlukas.strategygame.backend.common.ok
import de.ruegnerlukas.strategygame.backend.user.ports.models.AuthDataExtended
import de.ruegnerlukas.strategygame.backend.user.ports.provided.LoginUser
import de.ruegnerlukas.strategygame.backend.user.ports.provided.LoginUser.LoginUserError
import de.ruegnerlukas.strategygame.backend.user.ports.provided.LoginUser.NotAuthorizedError
import de.ruegnerlukas.strategygame.backend.user.ports.provided.LoginUser.UserNotConfirmedError
import de.ruegnerlukas.strategygame.backend.user.ports.provided.LoginUser.UserNotFoundError
import de.ruegnerlukas.strategygame.backend.user.ports.required.UserIdentityService

class LoginUserImpl(private val userIdentity: UserIdentityService) : LoginUser {

    override fun perform(email: String, password: String): Either<LoginUserError, AuthDataExtended> {
        return when (val result = userIdentity.authenticate(email, password)) {
            is Ok -> result.value.ok()
            is Err -> when (result.value) {
                UserIdentityService.NotAuthorizedError -> NotAuthorizedError.err()
                UserIdentityService.UserNotConfirmedError -> UserNotConfirmedError.err()
                UserIdentityService.UserNotFoundError -> UserNotFoundError.err()
            }
        }
    }

}