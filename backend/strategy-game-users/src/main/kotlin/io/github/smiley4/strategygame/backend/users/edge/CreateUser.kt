package io.github.smiley4.strategygame.backend.users.edge

interface CreateUser {

    sealed class CreateUserError(message: String? = null) : Exception(message)
    class UserAlreadyExistsError : CreateUserError("The user already exists")
    class InvalidEmailOrPasswordError : CreateUserError("The given email or password is not valid")
    class CodeDeliveryError : CreateUserError("The confirmation code could not be delivered (e.g. via email)")

    /**
     * Create a new user with the given email, password and username.
     * @throws CreateUserError
     */
    fun perform(email: String, password: String, username: String)

}