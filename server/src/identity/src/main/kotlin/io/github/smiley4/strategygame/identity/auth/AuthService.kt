package io.github.smiley4.strategygame.identity.auth

import io.github.smiley4.strategygame.identity.auth.domain.SessionToken
import io.github.smiley4.strategygame.identity.shared.UnsafePassword
import io.github.smiley4.strategygame.identity.shared.Username
import io.github.smiley4.strategygame.identity.user.RegisterUserError
import io.github.smiley4.strategygame.shared.domain.UserId

interface AuthService {
    /**
     * Authenticates credentials and returns a new session token.
     */
    fun login(username: Username, password: UnsafePassword): SessionToken


    /**
     * Revokes the given session.
     */
    fun logout(token: SessionToken)


    /**
     * Validates the token and returns the user's id
     */
    fun authenticate(token: SessionToken): UserId
}

sealed class LogInUserError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class InvalidUsernameOrPassword : LogInUserError("Provided invalid username or password")
}

sealed class LogOutError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class InvalidToken : LogOutError("Provided invalid token")
}

sealed class AuthenticateUserError(message: String?, cause: Throwable? = null) : Exception(message, cause) {
    class InvalidToken : AuthenticateUserError("Provided invalid token")
}