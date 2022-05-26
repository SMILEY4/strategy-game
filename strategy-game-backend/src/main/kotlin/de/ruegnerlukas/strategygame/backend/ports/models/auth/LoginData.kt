package de.ruegnerlukas.strategygame.backend.ports.models.auth

data class LoginData(
	val email: String,
	val password: String,
)