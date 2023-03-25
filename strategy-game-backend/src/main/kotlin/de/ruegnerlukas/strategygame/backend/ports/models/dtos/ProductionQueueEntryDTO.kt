package de.ruegnerlukas.strategygame.backend.ports.models.dtos

import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType

data class ProductionQueueEntryDTO(
    val entryId: String,
    val buildingType: BuildingType,
    val progress: Float
)