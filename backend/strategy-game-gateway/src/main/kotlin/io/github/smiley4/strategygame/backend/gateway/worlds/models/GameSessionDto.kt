package io.github.smiley4.strategygame.backend.gateway.worlds.models

data class GameSessionDto(
    val id: String,
    val name: String,
    val creationTimestamp: Long,
    val players: Int,
    val currentTurn: Int
)
