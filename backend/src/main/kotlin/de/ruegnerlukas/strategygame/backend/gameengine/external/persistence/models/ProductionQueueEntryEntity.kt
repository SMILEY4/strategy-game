package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.BuildingProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.SettlerProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.common.models.BuildingType
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection

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