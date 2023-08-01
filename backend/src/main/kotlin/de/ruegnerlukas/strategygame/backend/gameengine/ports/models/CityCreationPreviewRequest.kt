package de.ruegnerlukas.strategygame.backend.gameengine.ports.models

import de.ruegnerlukas.strategygame.backend.common.models.TilePosition

data class CityCreationPreviewRequest(
    val tile: TilePosition,
    val isProvinceCapital: Boolean
)
