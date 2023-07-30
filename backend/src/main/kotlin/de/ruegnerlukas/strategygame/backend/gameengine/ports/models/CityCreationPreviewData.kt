package de.ruegnerlukas.strategygame.backend.gameengine.ports.models

import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.RouteDTO

data class CityCreationPreviewData(
    val addedRoutes: List<RouteDTO>,
    val claimedTiles: List<TileRef>
)
