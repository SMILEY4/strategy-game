package io.github.smiley4.strategygame.backend.common.data


data class GameSessionData(
    val id: String,
    val name: String,
    val creationTimestamp: Long,
    val players: Int,
    val currentTurn: Int
)
