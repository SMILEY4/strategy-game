package de.ruegnerlukas.strategygame.backend.user.core

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.utils.Err
import de.ruegnerlukas.strategygame.backend.common.utils.Ok
import de.ruegnerlukas.strategygame.backend.common.utils.err
import de.ruegnerlukas.strategygame.backend.common.utils.ok
import de.ruegnerlukas.strategygame.backend.user.ports.provided.CreateUser
import de.ruegnerlukas.strategygame.backend.user.ports.provided.CreateUser.CodeDeliveryError
import de.ruegnerlukas.strategygame.backend.user.ports.provided.CreateUser.CreateUserError
import de.ruegnerlukas.strategygame.backend.user.ports.provided.CreateUser.InvalidEmailOrPasswordError
import de.ruegnerlukas.strategygame.backend.user.ports.provided.CreateUser.UserAlreadyExistsError
import de.ruegnerlukas.strategygame.backend.user.ports.required.UserIdentityService

class CreateUserImpl(private val userIdentity: UserIdentityService) : CreateUser {

    override fun perform(email: String, password: String, username: String): Either<CreateUserError, Unit> {
        return when (val result = userIdentity.createUser(email, password, username)) {
            is Ok -> Unit.ok()
            is Err -> when (result.value) {
                UserIdentityService.CodeDeliveryError -> CodeDeliveryError.err()
                UserIdentityService.InvalidEmailOrPasswordError -> InvalidEmailOrPasswordError.err()
                UserIdentityService.UserAlreadyExistsError -> UserAlreadyExistsError.err()
            }
        }
    }

}