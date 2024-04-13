package de.ruegnerlukas.strategygame.backend.common.detaillog.entity

import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLogEntry

data class DetailLogEntryEntity<T : Enum<*>>(
    val id: T,
    val data: Map<String, DetailLogValueEntity>
) {

    companion object {
        fun <T : Enum<*>> of(serviceModel: DetailLogEntry<T>) = DetailLogEntryEntity(
            id = serviceModel.id,
            data = serviceModel.data.mapValues { (_, value) -> DetailLogValueEntity.of(value) }
        )
    }

    fun asServiceModel() = DetailLogEntry(
        id = this.id,
        data = this.data.mapValues { (_, value) -> value.asServiceModel() }.toMutableMap()
    )

}