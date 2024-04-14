package de.ruegnerlukas.strategygame.backend.user.ports.provided

interface CreateUser {

    sealed class CreateUserError : Exception()

    /**
     * The user already exists
     */
    class UserAlreadyExistsError : CreateUserError()

    /**
     * The email or password is not valid
     */
    class InvalidEmailOrPasswordError : CreateUserError()

    /**
     * the confirmation code could not be delivered (e.g. via email)
     */
    class CodeDeliveryError : CreateUserError()

    /**
     * Create a new user with the given email, username and password
     * @throws CreateUserError
     */
    fun perform(email: String, password: String, username: String)

}