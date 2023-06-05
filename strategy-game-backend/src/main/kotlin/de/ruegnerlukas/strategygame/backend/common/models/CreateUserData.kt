package de.ruegnerlukas.strategygame.backend.common.models

data class CreateUserData(
    val email: String,
    val password: String,
    val username: String
)