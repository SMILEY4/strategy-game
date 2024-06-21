package io.github.smiley4.strategygame.backend.users.module.api

data class CreateUserData(
    val email: String,
    val password: String,
    val username: String
)