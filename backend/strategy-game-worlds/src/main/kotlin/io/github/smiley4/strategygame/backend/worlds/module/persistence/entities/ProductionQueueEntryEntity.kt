package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import com.fasterxml.jackson.annotation.JsonTypeInfo
import io.github.smiley4.strategygame.backend.commondata.BuildingType
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.ResourceCollection

@JsonTypeInfo(
    use = JsonTypeInfo.Id.MINIMAL_CLASS,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
internal sealed class ProductionQueueEntryEntity(
    val entryId: String,
    val collectedResources: List<ResourceStackEntity>
) {

    companion object {
        fun of(serviceModel: ProductionQueueEntry) =
            when (serviceModel) {
                is ProductionQueueEntry.Settler -> SettlerProductionQueueEntryEntity(
                    entryId = serviceModel.id.value,
                    collectedResources = serviceModel.collectedResources.toStacks().map { ResourceStackEntity.of(it) }
                )
                is ProductionQueueEntry.Building -> BuildingProductionQueueEntryEntity(
                    entryId = serviceModel.id.value,
                    collectedResources = serviceModel.collectedResources.toStacks().map { ResourceStackEntity.of(it) },
                    building = serviceModel.building
                )
            }
    }

    fun asServiceModel(): ProductionQueueEntry =
        when (this) {
            is SettlerProductionQueueEntryEntity -> ProductionQueueEntry.Settler(
                id = ProductionQueueEntry.Id(this.entryId),
                collectedResources = this.collectedResources.map { it.asServiceModel() }.let { ResourceCollection.basic(it) }
            )
            is BuildingProductionQueueEntryEntity -> ProductionQueueEntry.Building(
                id = ProductionQueueEntry.Id(this.entryId),
                collectedResources = this.collectedResources.map { it.asServiceModel() }.let { ResourceCollection.basic(it) },
                building = this.building
            )
        }

}

internal class SettlerProductionQueueEntryEntity(
    entryId: String,
    collectedResources: List<ResourceStackEntity>
) : ProductionQueueEntryEntity(entryId, collectedResources)

internal class BuildingProductionQueueEntryEntity(
    entryId: String,
    collectedResources: List<ResourceStackEntity>,
    val building: BuildingType
) : ProductionQueueEntryEntity(entryId, collectedResources)