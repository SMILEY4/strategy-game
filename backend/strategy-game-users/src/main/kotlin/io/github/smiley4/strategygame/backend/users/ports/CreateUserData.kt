package io.github.smiley4.strategygame.backend.users.ports

data class CreateUserData(
    val email: String,
    val password: String,
    val username: String
)