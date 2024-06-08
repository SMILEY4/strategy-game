package io.github.smiley4.strategygame.backend.common.models

data class Player(
    val userId: String,
    var connectionId: Long?,
    var state: PlayerState
)