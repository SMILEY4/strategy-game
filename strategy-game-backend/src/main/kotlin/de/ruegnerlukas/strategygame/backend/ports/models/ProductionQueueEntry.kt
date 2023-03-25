package de.ruegnerlukas.strategygame.backend.ports.models

class ProductionQueueEntry(
    val entryId: String,
    val buildingType: BuildingType,
    val collectedResources: ResourceStats,
) {

    fun getTotalRequiredResources(): Collection<ResourceStack> {
        return listOf(
            ResourceStack(ResourceType.WOOD, 10f),
            ResourceStack(ResourceType.STONE, 5f)
        )
    }

}