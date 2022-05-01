package de.ruegnerlukas.strategygame.backend.ports.models

import kotlinx.serialization.Serializable

@Serializable
data class AuthResult(
	val idToken: String,
	val refreshToken: String?,
) {
	constructor(extendedAuthResult: ExtendedAuthResult) : this(extendedAuthResult.idToken, extendedAuthResult.refreshToken)
}