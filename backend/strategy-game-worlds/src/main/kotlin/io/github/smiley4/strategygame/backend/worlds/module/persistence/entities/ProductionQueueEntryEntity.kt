package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import io.github.smiley4.strategygame.backend.commondata.BuildingType
import io.github.smiley4.strategygame.backend.commondata.ResourceCollection
import io.github.smiley4.strategygame.backend.commondata.BuildingProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry
import io.github.smiley4.strategygame.backend.commondata.SettlerProductionQueueEntry

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = BuildingProductionQueueEntryEntity::class),
    JsonSubTypes.Type(value = SettlerProductionQueueEntryEntity::class),
)
sealed class ProductionQueueEntryEntity(
    val type: String,
    val entryId: String,
    val collectedResources: List<ResourceStackEntity>,
) {

    companion object {
        fun of(serviceModel: ProductionQueueEntry) =
            when (serviceModel) {
                is BuildingProductionQueueEntry -> BuildingProductionQueueEntryEntity(
                    entryId = serviceModel.entryId,
                    collectedResources = serviceModel.collectedResources.toStacks().map { ResourceStackEntity.of(it) },
                    buildingType = serviceModel.buildingType
                )
                is SettlerProductionQueueEntry -> SettlerProductionQueueEntryEntity(
                    entryId = serviceModel.entryId,
                    collectedResources = serviceModel.collectedResources.toStacks().map { ResourceStackEntity.of(it) },
                )
            }
    }

    fun asServiceModel(): ProductionQueueEntry =
        when(this) {
            is BuildingProductionQueueEntryEntity -> BuildingProductionQueueEntry(
                entryId = this.entryId,
                buildingType = this.buildingType,
                collectedResources = ResourceCollection.basic(this.collectedResources.map { it.asServiceModel() })
            )
            is SettlerProductionQueueEntryEntity -> SettlerProductionQueueEntry(
                entryId = this.entryId,
                collectedResources = ResourceCollection.basic(this.collectedResources.map { it.asServiceModel() })
            )
        }

}


@JsonTypeName(BuildingProductionQueueEntryEntity.TYPE)
class BuildingProductionQueueEntryEntity(
    entryId: String,
    collectedResources: List<ResourceStackEntity>,
    val buildingType: BuildingType
) : ProductionQueueEntryEntity(TYPE, entryId, collectedResources) {
    companion object {
        internal const val TYPE = "building"
    }
}


@JsonTypeName(SettlerProductionQueueEntryEntity.TYPE)
class SettlerProductionQueueEntryEntity(
    entryId: String,
    collectedResources: List<ResourceStackEntity>,
) : ProductionQueueEntryEntity(TYPE, entryId, collectedResources) {
    companion object {
        internal const val TYPE = "settler"
    }
}