package io.github.smiley4.strategygame.backend.commondata

data class Route(
    val id: Id,
    val worldObjectA: WorldObject.Id,
    val worldObjectB: WorldObject.Id,
    val path: List<Tile.Ref>, // note: includes tiles with start/end world objects
    val cost: Float,
) {

    @JvmInline
    value class Id(val value: String) {
        companion object
    }

}