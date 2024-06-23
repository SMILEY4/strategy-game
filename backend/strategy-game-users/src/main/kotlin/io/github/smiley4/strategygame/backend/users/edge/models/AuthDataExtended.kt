package io.github.smiley4.strategygame.backend.users.edge.models

data class AuthDataExtended(
    val idToken: String,
    val refreshToken: String,
    val accessToken: String
)