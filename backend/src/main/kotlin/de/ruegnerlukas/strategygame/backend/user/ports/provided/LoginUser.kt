package de.ruegnerlukas.strategygame.backend.user.ports.provided

import de.ruegnerlukas.strategygame.backend.user.ports.models.AuthDataExtended

interface LoginUser {

    sealed class LoginUserError : Exception()

    /**
     * The given credentials are not valid, i.e. the user is not authorized
     */
    class NotAuthorizedError : LoginUserError()

    /**
     * The user has not confirmed the account yet
     */
    class UserNotConfirmedError : LoginUserError()

    /**
     * No user with the given data exists
     */
    class UserNotFoundError : LoginUserError()


    /**
     * Authenticate the given user
     * @throws LoginUserError
     */
    fun perform(email: String, password: String): AuthDataExtended

}