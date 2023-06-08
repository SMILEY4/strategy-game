package de.ruegnerlukas.strategygame.backend.gamesession.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.ports.models.TileRef

data class RouteDTO(
    val routeId: String,
    val cityIdA: String,
    val cityIdB: String,
    val path: List<TileRef>
)
