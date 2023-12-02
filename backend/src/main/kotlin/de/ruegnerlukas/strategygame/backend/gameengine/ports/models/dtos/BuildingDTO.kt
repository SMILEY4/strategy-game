package de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.common.detaillog.dto.DetailLogEntryDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.BuildingDetailType
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileRef

data class BuildingDTO(
    val type: String,
    val tile: TileRef?,
    val active: Boolean,
    val details: List<DetailLogEntryDTO<BuildingDetailType>>
)