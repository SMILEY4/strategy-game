package de.ruegnerlukas.strategygame.backend.ports.models.auth

import kotlinx.serialization.Serializable

@Serializable
data class CreateUserData(
	val email: String,
	val password: String,
	val username: String
)