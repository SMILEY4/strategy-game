package io.github.smiley4.strategygame.backend.common.detaillog.dto

import io.github.smiley4.strategygame.backend.common.detaillog.DetailLogEntry


data class DetailLogEntryDTO<T : Enum<*>>(
    val id: T,
    val data: Map<String, DetailLogValueDTO>
) {

    companion object {

        fun <T : Enum<*>> of(serviceModel: DetailLogEntry<T>) = DetailLogEntryDTO(
            id = serviceModel.id,
            data = serviceModel.data.mapValues { (_, value) -> DetailLogValueDTO.of(value) }
        )

    }

}