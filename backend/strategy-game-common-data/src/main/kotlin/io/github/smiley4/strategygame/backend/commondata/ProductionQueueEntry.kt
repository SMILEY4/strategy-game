package io.github.smiley4.strategygame.backend.commondata


sealed class ProductionQueueEntry(
    val id: Id,
    val requiredResources: ResourceCollection,
    val collectedResources: ResourceCollection
) {

    @JvmInline
    value class Id(val value: String) {
        companion object
    }

    class Settler(
        id: Id,
        collectedResources: ResourceCollection
    ) : ProductionQueueEntry(id, ResourceCollection.basic(ResourceType.WOOD.amount(5f)), collectedResources)

}
