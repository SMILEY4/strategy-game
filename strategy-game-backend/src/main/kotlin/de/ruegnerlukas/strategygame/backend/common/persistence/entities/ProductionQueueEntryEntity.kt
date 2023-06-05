package de.ruegnerlukas.strategygame.backend.common.persistence.entities

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.common.models.BuildingProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.common.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.common.models.ResourceStack
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueEntry
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceCollection
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStack
import de.ruegnerlukas.strategygame.backend.ports.models.SettlerProductionQueueEntry

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
    val collectedResources: List<ResourceStack>,
) {

    companion object {
        fun of(serviceModel: ProductionQueueEntry) =
            when (serviceModel) {
                is BuildingProductionQueueEntry -> BuildingProductionQueueEntryEntity(
                    entryId = serviceModel.entryId,
                    collectedResources = serviceModel.collectedResources.toStacks(),
                    buildingType = serviceModel.buildingType
                )
                is SettlerProductionQueueEntry -> SettlerProductionQueueEntryEntity(
                    entryId = serviceModel.entryId,
                    collectedResources = serviceModel.collectedResources.toStacks(),
                )
            }
    }

    fun asServiceModel(): ProductionQueueEntry =
        when(this) {
            is BuildingProductionQueueEntryEntity -> BuildingProductionQueueEntry(
                entryId = this.entryId,
                buildingType = this.buildingType,
                collectedResources = ResourceCollection.basic(this.collectedResources)
            )
            is SettlerProductionQueueEntryEntity -> SettlerProductionQueueEntry(
                entryId = this.entryId,
                collectedResources = ResourceCollection.basic(this.collectedResources)
            )
        }

}


@JsonTypeName(BuildingProductionQueueEntryEntity.TYPE)
class BuildingProductionQueueEntryEntity(
    entryId: String,
    collectedResources: List<ResourceStack>,
    val buildingType: BuildingType
) : ProductionQueueEntryEntity(TYPE, entryId, collectedResources) {
    companion object {
        internal const val TYPE = "building"
    }
}


@JsonTypeName(SettlerProductionQueueEntryEntity.TYPE)
class SettlerProductionQueueEntryEntity(
    entryId: String,
    collectedResources: List<ResourceStack>,
) : ProductionQueueEntryEntity(TYPE, entryId, collectedResources) {
    companion object {
        internal const val TYPE = "settler"
    }
}