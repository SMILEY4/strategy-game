package de.ruegnerlukas.strategygame.backend.gamesession.ports.models


data class GameSessionData(
    val id: String,
    val name: String,
    val creationTimestamp: Long,
    val players: Int,
    val currentTurn: Int
)
