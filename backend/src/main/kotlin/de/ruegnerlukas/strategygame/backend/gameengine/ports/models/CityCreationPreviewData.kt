package de.ruegnerlukas.strategygame.backend.gameengine.ports.models

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.RouteDTO

data class CityCreationPreviewData(
    val addedRoutes: Sequence<RouteDTO>,
    val claimedTiles: List<TileRef>
)
