package de.ruegnerlukas.strategygame.backend.external.api.models

import kotlinx.serialization.Serializable

@Serializable
data class LoginData(
	val email: String,
	val password: String,
)