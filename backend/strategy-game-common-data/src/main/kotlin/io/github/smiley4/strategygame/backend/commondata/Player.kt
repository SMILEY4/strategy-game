package io.github.smiley4.strategygame.backend.commondata

data class Player(
    val userId: String,
    var connectionId: Long?,
    var state: PlayerState
)