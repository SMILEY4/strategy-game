package de.ruegnerlukas.strategygame.backend.user.ports.provided

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.user.ports.models.AuthData

interface RefreshUserToken {

    sealed class RefreshTokenError

    object NotAuthorizedError : RefreshTokenError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    object UserNotConfirmedError : RefreshTokenError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    object UserNotFoundError : RefreshTokenError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    fun perform(refreshToken: String): Either<RefreshTokenError, AuthData>

}