package de.ruegnerlukas.strategygame.backend.ports.models.auth

data class ExtendedAuthData(
	val idToken: String,
	val refreshToken: String,
	val accessToken: String
)