package de.ruegnerlukas.strategygame.backend.gamesession.ports.models

data class Game(
    val gameId: String,
    var turn: Int,
    val players: PlayerContainer
)
