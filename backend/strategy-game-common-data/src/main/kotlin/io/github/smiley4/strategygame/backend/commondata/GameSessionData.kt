package io.github.smiley4.strategygame.backend.commondata


// todo: naming?  -> GameWorldData ?
data class GameSessionData(
    val game: Game.Id,
    val name: String,
    val creationTimestamp: Long,
    val players: Int,
    val currentTurn: Int
)
