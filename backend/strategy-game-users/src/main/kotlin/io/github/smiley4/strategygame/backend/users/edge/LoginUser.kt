package io.github.smiley4.strategygame.backend.users.edge

import io.github.smiley4.strategygame.backend.users.edge.models.AuthDataExtended

interface LoginUser {

    sealed class LoginUserError(message: String? = null) : Exception(message)
    class NotAuthorizedError : LoginUserError("The given credentials are not valid, i.e. the user is not authorized")
    class UserNotConfirmedError : LoginUserError("The user has not confirmed the account yet")
    class UserNotFoundError : LoginUserError("No user with the given data exists")

    /**
     * Checks the given email and password and returns a valid auth token
     * @throws LoginUserError
     */
    fun perform(email: String, password: String): AuthDataExtended

}