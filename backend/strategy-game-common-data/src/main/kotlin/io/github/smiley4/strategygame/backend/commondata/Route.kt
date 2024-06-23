package io.github.smiley4.strategygame.backend.commondata

data class Route(
    val routeId: String,
    val cityIdA: String,
    val cityIdB: String,
    val path: List<TileRef>
)