package io.github.smiley4.strategygame.backend.users.edge

interface DeleteUser {

    sealed class DeleteUserError(message: String? = null) : Exception(message)
    class NotAuthorizedError : DeleteUserError("The given credentials are not valid, i.e. the user is not authorized")
    class UserNotConfirmedError : DeleteUserError("The user has not confirmed the account yet")
    class UserNotFoundError : DeleteUserError("No user with the given data exists")

    /**
     * Deletes the user with the given email and password
     * @throws DeleteUserError
     */
    fun perform(email: String, password: String)

}