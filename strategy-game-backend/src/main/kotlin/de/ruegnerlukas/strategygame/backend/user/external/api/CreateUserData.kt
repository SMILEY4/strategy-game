package de.ruegnerlukas.strategygame.backend.user.external.api

data class CreateUserData(
    val email: String,
    val password: String,
    val username: String
)