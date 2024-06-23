package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commondata.DetailLogEntry


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