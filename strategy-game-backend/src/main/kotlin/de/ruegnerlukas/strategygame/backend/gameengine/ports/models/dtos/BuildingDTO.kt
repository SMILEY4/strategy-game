package de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.common.models.TileRef

data class BuildingDTO(
    val type: String,
    val tile: TileRef?,
    val active: Boolean
)