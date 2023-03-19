package de.ruegnerlukas.strategygame.backend.ports.models

data class CreateUserData(
    val email: String,
    val password: String,
    val username: String
)