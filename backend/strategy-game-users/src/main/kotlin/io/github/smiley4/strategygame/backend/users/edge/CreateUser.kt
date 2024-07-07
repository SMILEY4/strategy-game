package io.github.smiley4.strategygame.backend.users.edge

interface CreateUser {

    sealed class CreateUserError(message: String? = null, cause: Throwable? = null) : Exception(message, cause)
    class UserAlreadyExistsError(cause: Throwable? = null) : CreateUserError("The user already exists", cause)
    class InvalidEmailOrPasswordError(cause: Throwable? = null) : CreateUserError("The given email or password is not valid", cause)
    class CodeDeliveryError(cause: Throwable? = null) : CreateUserError("The confirmation code could not be delivered (e.g. via email)", cause)

    /**
     * Create a new user with the given email, password and username.
     * @throws CreateUserError
     */
    fun perform(email: String, password: String, username: String)

}