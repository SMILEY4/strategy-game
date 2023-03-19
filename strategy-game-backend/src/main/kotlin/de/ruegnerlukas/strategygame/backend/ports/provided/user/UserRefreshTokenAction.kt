package de.ruegnerlukas.strategygame.backend.ports.provided.user

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.AuthData

interface UserRefreshTokenAction {

    sealed class UserRefreshTokenActionError

    object NotAuthorizedError : UserRefreshTokenActionError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    object UserNotConfirmedError : UserRefreshTokenActionError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    object UserNotFoundError : UserRefreshTokenActionError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    fun perform(refreshToken: String): Either<UserRefreshTokenActionError, AuthData>

}