package io.github.smiley4.strategygame.backend.users.edge

import io.github.smiley4.strategygame.backend.users.edge.models.AuthDataExtended

interface LoginUser {

    sealed class LoginUserError(message: String? = null, cause: Throwable? = null) : Exception(message, cause)
    class NotAuthorizedError(cause: Throwable? = null) : LoginUserError("The given credentials are not valid, i.e. the user is not authorized", cause)
    class UserNotConfirmedError(cause: Throwable? = null) : LoginUserError("The user has not confirmed the account yet", cause)
    class UserNotFoundError(cause: Throwable? = null) : LoginUserError("No user with the given data exists", cause)

    /**
     * Checks the given email and password and returns a valid auth token
     * @throws LoginUserError
     */
    fun perform(email: String, password: String): AuthDataExtended

}