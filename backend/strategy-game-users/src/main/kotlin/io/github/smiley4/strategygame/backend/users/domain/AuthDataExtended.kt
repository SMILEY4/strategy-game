package io.github.smiley4.strategygame.backend.users.domain

data class AuthDataExtended(
    val idToken: String,
    val refreshToken: String,
    val accessToken: String
)