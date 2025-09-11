package io.github.smiley4.strategygame.backend.commondata

data class Player(
    val user: User.Id,
    var connectionId: Long?,
    var state: PlayerState
)