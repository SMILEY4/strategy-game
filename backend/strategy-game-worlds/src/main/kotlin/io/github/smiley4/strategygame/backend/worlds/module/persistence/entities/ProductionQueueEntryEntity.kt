package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = SettlerProductionQueueEntryEntity::class),
)
internal sealed class ProductionQueueEntryEntity(
    val type: String,
    val entryId: String,
    val progress: Float,
) {

    companion object {
        fun of(serviceModel: ProductionQueueEntry) =
            when (serviceModel) {
                is ProductionQueueEntry.Settler -> SettlerProductionQueueEntryEntity(
                    entryId = serviceModel.entryId,
                    progress = serviceModel.progress
                )
            }
    }

    fun asServiceModel(): ProductionQueueEntry =
        when (this) {
            is SettlerProductionQueueEntryEntity -> ProductionQueueEntry.Settler(
                entryId = this.entryId,
                progress = this.progress
            )
        }

}


@JsonTypeName(SettlerProductionQueueEntryEntity.TYPE)
internal class SettlerProductionQueueEntryEntity(
    entryId: String,
    progress: Float
) : ProductionQueueEntryEntity(TYPE, entryId, progress) {
    companion object {
        internal const val TYPE = "settler"
    }
}