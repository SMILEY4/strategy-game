package de.ruegnerlukas.strategygame.backend.ports.models

class ProductionQueueEntry(
    val buildingType: BuildingType,
    val collectedResources: ResourceStats,
)