package io.github.smiley4.strategygame.identity.user

import io.github.smiley4.strategygame.identity.shared.UnsafePassword
import io.github.smiley4.strategygame.identity.shared.Username
import io.github.smiley4.strategygame.shared.values.UserId

/**
 * Service responsible for user operations.
 */
interface UserService {
    /**
     * Register a new user. Throws [RegisterUserError.AlreadyTaken] if the username is not unique.
     */
    suspend fun register(username: Username, password: UnsafePassword): UserId
    /**
     * Change the password for an existing user.
     */
    fun changePassword(userId: UserId, newPassword: UnsafePassword)
    /**
     * Change the username for an existing user.
     */
    suspend fun changeUsername(userId: UserId, newUsername: Username)
}


/**
 * Errors that can occur during user registration.
 */
sealed class RegisterUserError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class AlreadyTaken(username: String) : RegisterUserError("Username $username is not unique")
}


/**
 * Errors that can occur when changing a password.
 */
sealed class ChangePasswordError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class UserNotFound(id: UserId) : ChangePasswordError("User with id ${id.id} could not be found")
}


/**
 * Errors that can occur when changing a username.
 */
sealed class ChangeUsernameError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class UserNotFound(id: UserId) : ChangeUsernameError("User with id ${id.id} could not be found")
    class AlreadyTaken(username: String) : ChangeUsernameError("Username $username already taken")
}
