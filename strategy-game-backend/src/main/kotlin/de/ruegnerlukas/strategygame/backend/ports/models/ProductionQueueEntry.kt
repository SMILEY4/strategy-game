package de.ruegnerlukas.strategygame.backend.ports.models

class ProductionQueueEntry(
    val entryId: String,
    val buildingType: BuildingType,
    val collectedResources: ResourceStats,
) {

    fun getTotalRequiredResources(): Collection<ResourceStack> {
        return buildingType.templateData.constructionCost
    }

}