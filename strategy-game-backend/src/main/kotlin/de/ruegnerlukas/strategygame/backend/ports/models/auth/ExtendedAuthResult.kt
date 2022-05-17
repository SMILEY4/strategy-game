package de.ruegnerlukas.strategygame.backend.ports.models.auth

import kotlinx.serialization.Serializable

@Serializable
data class ExtendedAuthResult(
	val idToken: String,
	val refreshToken: String,
	val accessToken: String
)