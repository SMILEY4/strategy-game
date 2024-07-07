package io.github.smiley4.strategygame.backend.users.edge

interface DeleteUser {

    sealed class DeleteUserError(message: String? = null, cause: Throwable? = null) : Exception(message, cause)
    class NotAuthorizedError(cause: Throwable? = null) : DeleteUserError("The given credentials are not valid, i.e. the user is not authorized", cause)
    class UserNotConfirmedError(cause: Throwable? = null) : DeleteUserError("The user has not confirmed the account yet", cause)
    class UserNotFoundError(cause: Throwable? = null) : DeleteUserError("No user with the given data exists", cause)

    /**
     * Deletes the user with the given email and password
     * @throws DeleteUserError
     */
    fun perform(email: String, password: String)

}