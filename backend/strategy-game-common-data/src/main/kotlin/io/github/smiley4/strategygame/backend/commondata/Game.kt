package io.github.smiley4.strategygame.backend.commondata

data class Game(
    val id: Id,
    val name: String,
    val creationTimestamp: Long,
    var turn: Int,
    val players: PlayerContainer
) {
    @JvmInline
    value class Id(val value: String)
}
