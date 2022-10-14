package de.ruegnerlukas.strategygame.backend.ports.provided.user

import arrow.core.Either

interface UserDeleteAction {

    sealed class DeleteUserActionError

    object NotAuthorizedError : DeleteUserActionError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    object UserNotConfirmedError : DeleteUserActionError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    object UserNotFoundError : DeleteUserActionError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    suspend fun perform(email: String, password: String): Either<DeleteUserActionError, Unit>

}