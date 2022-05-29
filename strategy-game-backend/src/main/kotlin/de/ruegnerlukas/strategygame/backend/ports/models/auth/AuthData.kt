package de.ruegnerlukas.strategygame.backend.ports.models.auth

data class AuthData(
	val idToken: String,
	val refreshToken: String?,
) {
	constructor(extendedAuthData: ExtendedAuthData) : this(extendedAuthData.idToken, extendedAuthData.refreshToken)
}