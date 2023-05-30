package de.ruegnerlukas.strategygame.backend.user.ports.provided

import arrow.core.Either

interface DeleteUser {

    sealed class DeleteUserError

    object NotAuthorizedError : DeleteUserError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    object UserNotConfirmedError : DeleteUserError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    object UserNotFoundError : DeleteUserError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    suspend fun perform(email: String, password: String): Either<DeleteUserError, Unit>

}