package io.github.smiley4.strategygame.identity.user

import io.github.smiley4.strategygame.identity.shared.UnsafePassword
import io.github.smiley4.strategygame.identity.shared.Username
import io.github.smiley4.strategygame.shared.values.UserId

/**
 * Service responsible for user operations.
 */
interface UserService {
    suspend fun register(username: Username, password: UnsafePassword): UserId
    fun changePassword(userId: UserId, newPassword: UnsafePassword)
    suspend fun changeUsername(userId: UserId, newUsername: Username)
}


sealed class RegisterUserError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class AlreadyTaken(username: String) : RegisterUserError("Username $username is not unique")
}


sealed class ChangePasswordError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class UserNotFound(id: UserId) : ChangePasswordError("User with id ${id.id} could not be found")
}


sealed class ChangeUsernameError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class UserNotFound(id: UserId) : ChangeUsernameError("User with id ${id.id} could not be found")
    class AlreadyTaken(username: String) : ChangeUsernameError("Username $username already taken")
}
