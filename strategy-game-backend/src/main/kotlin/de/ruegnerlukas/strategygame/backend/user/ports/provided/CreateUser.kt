package de.ruegnerlukas.strategygame.backend.user.ports.provided

import arrow.core.Either

interface CreateUser {

    sealed class CreateUserError

    object UserAlreadyExistsError : CreateUserError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    object InvalidEmailOrPasswordError : CreateUserError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    object CodeDeliveryError : CreateUserError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    fun perform(email: String, password: String, username: String): Either<CreateUserError, Unit>

}