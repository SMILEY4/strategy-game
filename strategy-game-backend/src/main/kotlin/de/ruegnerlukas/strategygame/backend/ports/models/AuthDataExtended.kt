package de.ruegnerlukas.strategygame.backend.ports.models

data class AuthDataExtended(
    val idToken: String,
    val refreshToken: String,
    val accessToken: String
)