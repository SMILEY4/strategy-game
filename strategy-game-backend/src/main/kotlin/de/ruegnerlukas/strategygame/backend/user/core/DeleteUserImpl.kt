package de.ruegnerlukas.strategygame.backend.user.core

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.common.Err
import de.ruegnerlukas.strategygame.backend.common.Ok
import de.ruegnerlukas.strategygame.backend.common.err
import de.ruegnerlukas.strategygame.backend.common.ok
import de.ruegnerlukas.strategygame.backend.user.ports.provided.DeleteUser
import de.ruegnerlukas.strategygame.backend.user.ports.provided.DeleteUser.DeleteUserError
import de.ruegnerlukas.strategygame.backend.user.ports.provided.DeleteUser.NotAuthorizedError
import de.ruegnerlukas.strategygame.backend.user.ports.required.UserIdentityService

class DeleteUserImpl(private val userIdentity: UserIdentityService) : DeleteUser {

    override suspend fun perform(email: String, password: String): Either<DeleteUserError, Unit> {
        return when (val result = userIdentity.deleteUser(email, password)) {
            is Ok -> Unit.ok()
            is Err -> when (result.value) {
                UserIdentityService.NotAuthorizedError -> NotAuthorizedError.err()
            }
        }
    }

}