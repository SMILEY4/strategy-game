package io.github.smiley4.strategygame.backend.users.module.core

data class AuthData(
    val idToken: String,
    val refreshToken: String?,
) {
    constructor(authDataExtended: AuthDataExtended) : this(authDataExtended.idToken, authDataExtended.refreshToken)
}