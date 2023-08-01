package de.ruegnerlukas.strategygame.backend.user.ports.provided

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.user.ports.models.AuthDataExtended

interface LoginUser {

    sealed class LoginUserError

    object NotAuthorizedError : LoginUserError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    object UserNotConfirmedError : LoginUserError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    object UserNotFoundError : LoginUserError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    fun perform(email: String, password: String): Either<LoginUserError, AuthDataExtended>

}