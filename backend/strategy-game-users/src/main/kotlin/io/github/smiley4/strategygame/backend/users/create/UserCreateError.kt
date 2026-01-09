package io.github.smiley4.strategygame.backend.users.create

internal sealed class UserCreateError(message: String, cause: Throwable? = null) : Exception(message, cause) {
    class UserAlreadyExistsError(cause: Throwable? = null) : UserCreateError("The user already exists", cause)
    class InvalidEmailOrPasswordError(cause: Throwable? = null) : UserCreateError("The given email or password is not valid", cause)
    class CodeDeliveryError(cause: Throwable? = null) : UserCreateError("The confirmation code could not be delivered", cause)
}