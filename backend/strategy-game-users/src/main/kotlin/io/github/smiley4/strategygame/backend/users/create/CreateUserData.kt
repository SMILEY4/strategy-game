package io.github.smiley4.strategygame.backend.users.create

data class CreateUserData(
    val email: String,
    val password: String,
    val username: String
)