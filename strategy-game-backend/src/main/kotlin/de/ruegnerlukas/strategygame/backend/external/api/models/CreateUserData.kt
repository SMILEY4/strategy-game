package de.ruegnerlukas.strategygame.backend.external.api.models

import kotlinx.serialization.Serializable

@Serializable
data class CreateUserData(
	val email: String,
	val password: String,
	val username: String
)