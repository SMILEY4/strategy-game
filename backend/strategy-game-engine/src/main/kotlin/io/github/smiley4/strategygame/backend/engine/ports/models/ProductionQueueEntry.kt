package io.github.smiley4.strategygame.backend.engine.ports.models

import io.github.smiley4.strategygame.backend.common.models.BuildingType
import io.github.smiley4.strategygame.backend.common.models.resources.ResourceCollection
import io.github.smiley4.strategygame.backend.common.models.resources.ResourceType
import io.github.smiley4.strategygame.backend.common.models.resources.amount


sealed class ProductionQueueEntry(
    val entryId: String,
    val collectedResources: ResourceCollection
) {
    abstract fun getTotalRequiredResources(): ResourceCollection
}


class BuildingProductionQueueEntry(
    entryId: String,
    collectedResources: ResourceCollection,
    val buildingType: BuildingType,
) : ProductionQueueEntry(entryId, collectedResources) {

    override fun getTotalRequiredResources(): ResourceCollection {
        return ResourceCollection.basic(buildingType.templateData.constructionCost)
    }

}


class SettlerProductionQueueEntry(
    entryId: String,
    collectedResources: ResourceCollection
) : ProductionQueueEntry(entryId, collectedResources) {

    override fun getTotalRequiredResources(): ResourceCollection {
        return ResourceCollection.basic( // TODO: AMOUNT CONFIGURABLE
            ResourceType.FOOD.amount(10f),
            ResourceType.WOOD.amount(5f)
        )
    }

}
