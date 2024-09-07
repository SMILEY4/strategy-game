package io.github.smiley4.strategygame.backend.commondata

data class Route(
    val id: Id,
    val settlementA: Settlement.Id,
    val settlementB: Settlement.Id,
    val path: List<TileRef>
) {
    @JvmInline
    value class Id(val value: String)
}