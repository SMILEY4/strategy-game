package io.github.smiley4.strategygame.identity.auth

/**
 * Errors for the auth domain.
 */
sealed class AuthError(message: String?, cause: Throwable?) : Exception(message, cause) {
    class InvalidUsernameOrPassword : AuthError("User provided invalid username or password", null)
    class InvalidToken : AuthError("User provided invalid token", null)
}
