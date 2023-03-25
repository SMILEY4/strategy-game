package de.ruegnerlukas.strategygame.backend.external.persistence.entities

import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStack

data class ProductionQueueEntryEntity(
    val entryId: String,
    val buildingType: BuildingType,
    val collectedResources: List<ResourceStack>,
)