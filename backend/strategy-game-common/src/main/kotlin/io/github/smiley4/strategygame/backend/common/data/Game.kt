package io.github.smiley4.strategygame.backend.common.data

data class Game(
    val gameId: String,
    val name: String,
    val creationTimestamp: Long,
    var turn: Int,
    val players: PlayerContainer
)
