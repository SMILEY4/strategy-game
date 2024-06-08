package io.github.smiley4.strategygame.backend.users.ports.provided

interface DeleteUser {

    sealed class DeleteUserError : Exception()


    /**
     * The given credentials are not valid, i.e. the user is not authorized
     */
    class NotAuthorizedError : DeleteUserError()


    /**
     * The user has not confirmed the account yet
     */
    class UserNotConfirmedError : DeleteUserError()


    /**
     * No user with the given data exists
     */
    class UserNotFoundError : DeleteUserError()


    /**
     * Deletes the user with the given email and password
     * @throws DeleteUserError
     */
    suspend fun perform(email: String, password: String)

}