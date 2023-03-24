package de.ruegnerlukas.strategygame.backend.external.persistence.entities

import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStats

data class ProductionQueueEntryEntity(
    val buildingType: BuildingType,
    val collectedResources: ResourceStats,
)