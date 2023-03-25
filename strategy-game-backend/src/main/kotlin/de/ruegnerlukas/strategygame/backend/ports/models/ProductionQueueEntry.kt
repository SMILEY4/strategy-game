package de.ruegnerlukas.strategygame.backend.ports.models

class ProductionQueueEntry(
    val entryId: String,
    val buildingType: BuildingType,
    val collectedResources: ResourceCollection,
) {

    fun getTotalRequiredResources(): ResourceCollection {
        return ResourceCollection.basic(buildingType.templateData.constructionCost)
    }

}