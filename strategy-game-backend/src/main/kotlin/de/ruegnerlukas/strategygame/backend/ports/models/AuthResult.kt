package de.ruegnerlukas.strategygame.backend.ports.models

data class AuthResult(
	val idToken: String,
	val accessToken: String,
	val refreshToken: String,
)