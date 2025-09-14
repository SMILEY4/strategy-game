package io.github.smiley4.strategygame.backend.commondata

data class WorldObject(
    val id: Id,
    val tile: Tile.Ref,
) {
    @JvmInline
    value class Id(val value: String) {
        companion object
    }
}