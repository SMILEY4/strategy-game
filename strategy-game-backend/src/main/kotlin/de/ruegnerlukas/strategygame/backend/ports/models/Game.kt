package de.ruegnerlukas.strategygame.backend.ports.models

data class Game(
    val gameId: String,
    var turn: Int,
    val players: MutableList<Player>
)

