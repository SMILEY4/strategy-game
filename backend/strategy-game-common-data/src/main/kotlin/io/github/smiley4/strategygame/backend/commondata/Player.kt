package io.github.smiley4.strategygame.backend.commondata

data class Player(
    val userId: String,
    var connectionId: Long?,
    var state: io.github.smiley4.strategygame.backend.common.data.PlayerState
)