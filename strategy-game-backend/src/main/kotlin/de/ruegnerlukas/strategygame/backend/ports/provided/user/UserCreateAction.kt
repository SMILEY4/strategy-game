package de.ruegnerlukas.strategygame.backend.ports.provided.user

import arrow.core.Either

interface UserCreateAction {

    sealed class UserCreateActionError

    object UserAlreadyExistsError : UserCreateActionError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    object InvalidEmailOrPasswordError : UserCreateActionError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    object CodeDeliveryError : UserCreateActionError() {
        override fun toString(): String = this.javaClass.simpleName
    }

    fun perform(email: String, password: String, username: String): Either<UserCreateActionError, Unit>

}