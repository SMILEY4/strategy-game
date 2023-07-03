package de.ruegnerlukas.strategygame.backend.gamesession.ports.models

data class Player(
    val userId: String,
    var connectionId: Long?,
    var state: PlayerState
)