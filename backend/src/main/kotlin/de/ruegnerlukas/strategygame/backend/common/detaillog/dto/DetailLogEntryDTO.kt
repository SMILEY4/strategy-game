package de.ruegnerlukas.strategygame.backend.common.detaillog.dto

import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLogEntry


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