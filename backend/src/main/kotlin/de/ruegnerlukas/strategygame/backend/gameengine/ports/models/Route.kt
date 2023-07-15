package de.ruegnerlukas.strategygame.backend.gameengine.ports.models

data class Route(
    val routeId: String,
    val cityIdA: String,
    val cityIdB: String,
    val path: List<TileRef>
)