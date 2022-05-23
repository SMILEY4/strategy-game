package de.ruegnerlukas.strategygame.backend.ports.models.auth

import kotlinx.serialization.Serializable

@Serializable
data class ExtendedAuthData(
	val idToken: String,
	val refreshToken: String,
	val accessToken: String
)