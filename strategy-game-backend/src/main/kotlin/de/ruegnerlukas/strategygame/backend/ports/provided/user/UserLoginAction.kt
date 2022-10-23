package de.ruegnerlukas.strategygame.backend.ports.provided.user

import arrow.core.Either
import de.ruegnerlukas.strategygame.backend.ports.models.AuthDataExtended

interface UserLoginAction {

    sealed class UserLoginActionError

    object NotAuthorizedError : UserLoginActionError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    object UserNotConfirmedError : UserLoginActionError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    object UserNotFoundError : UserLoginActionError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    fun perform(email: String, password: String): Either<UserLoginActionError, AuthDataExtended>

}