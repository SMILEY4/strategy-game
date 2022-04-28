package de.ruegnerlukas.strategygame.backend.ports.models

import kotlinx.serialization.Serializable

@Serializable
data class AuthData(
	val username: String,
	val password: String
)