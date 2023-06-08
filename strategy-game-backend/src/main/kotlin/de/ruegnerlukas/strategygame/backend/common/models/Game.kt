package de.ruegnerlukas.strategygame.backend.common.models

data class Game(
    val gameId: String,
    var turn: Int,
    val players: PlayerContainer
)
