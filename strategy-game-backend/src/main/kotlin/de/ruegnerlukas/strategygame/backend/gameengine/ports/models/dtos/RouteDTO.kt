package de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.common.models.TileRef

data class RouteDTO(
    val routeId: String,
    val cityIdA: String,
    val cityIdB: String,
    val path: List<TileRef>
)
