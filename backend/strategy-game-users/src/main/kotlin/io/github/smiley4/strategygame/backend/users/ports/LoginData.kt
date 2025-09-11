package io.github.smiley4.strategygame.backend.users.ports

data class LoginData(
    val email: String,
    val password: String,
)