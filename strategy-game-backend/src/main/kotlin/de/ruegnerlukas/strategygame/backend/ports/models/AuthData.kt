package de.ruegnerlukas.strategygame.backend.ports.models

data class AuthData(
    val idToken: String,
    val refreshToken: String?,
) {
    constructor(authDataExtended: AuthDataExtended) : this(authDataExtended.idToken, authDataExtended.refreshToken)
}