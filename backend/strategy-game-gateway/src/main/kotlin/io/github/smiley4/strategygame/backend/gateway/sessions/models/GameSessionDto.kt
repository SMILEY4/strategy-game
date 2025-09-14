package io.github.smiley4.strategygame.backend.gateway.sessions.models

data class GameSessionDto(
    val id: String,
    val name: String,
    val creationTimestamp: Long,
    val currentTurn: Int
)
