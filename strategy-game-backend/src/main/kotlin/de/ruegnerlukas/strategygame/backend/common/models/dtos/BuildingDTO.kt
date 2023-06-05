package de.ruegnerlukas.strategygame.backend.common.models.dtos

import de.ruegnerlukas.strategygame.backend.ports.models.TileRef

data class BuildingDTO(
    val type: String,
    val tile: TileRef?,
    val active: Boolean
)