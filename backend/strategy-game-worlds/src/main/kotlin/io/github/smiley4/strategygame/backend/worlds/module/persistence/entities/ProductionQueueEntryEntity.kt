package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import com.fasterxml.jackson.annotation.JsonTypeInfo
import io.github.smiley4.strategygame.backend.commondata.ProductionQueueEntry

@JsonTypeInfo(
    use = JsonTypeInfo.Id.MINIMAL_CLASS,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
internal sealed class ProductionQueueEntryEntity(
    val entryId: String,
    val progress: Float,
) {

    companion object {
        fun of(serviceModel: ProductionQueueEntry) =
            when (serviceModel) {
                is ProductionQueueEntry.Settler -> SettlerProductionQueueEntryEntity(
                    entryId = serviceModel.id.value,
                    progress = serviceModel.progress
                )
            }
    }

    fun asServiceModel(): ProductionQueueEntry =
        when (this) {
            is SettlerProductionQueueEntryEntity -> ProductionQueueEntry.Settler(
                id = ProductionQueueEntry.Id(this.entryId),
                progress = this.progress
            )
        }

}

internal class SettlerProductionQueueEntryEntity(
    entryId: String,
    progress: Float
) : ProductionQueueEntryEntity(entryId, progress)