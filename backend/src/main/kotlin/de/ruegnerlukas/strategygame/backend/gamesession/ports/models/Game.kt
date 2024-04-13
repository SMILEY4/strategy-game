package de.ruegnerlukas.strategygame.backend.gamesession.ports.models

data class Game(
    val gameId: String,
    val name: String,
    val creationTimestamp: Long,
    var turn: Int,
    val players: PlayerContainer
)
