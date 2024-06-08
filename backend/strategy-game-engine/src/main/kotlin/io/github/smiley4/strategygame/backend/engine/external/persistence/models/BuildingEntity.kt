package io.github.smiley4.strategygame.backend.engine.external.persistence.models

import io.github.smiley4.strategygame.backend.common.detaillog.DetailLog
import io.github.smiley4.strategygame.backend.common.models.BuildingType
import io.github.smiley4.strategygame.backend.common.utils.mapMutable
import io.github.smiley4.strategygame.backend.engine.ports.models.Building
import io.github.smiley4.strategygame.backend.engine.ports.models.BuildingDetailType


class BuildingEntity(
    val type: BuildingType,
    val tile: TileRefEntity?,
    val active: Boolean,
    val details: List<DetailLogEntryEntity<BuildingDetailType>>
) {

    companion object {
        fun of(serviceModel: Building) = BuildingEntity(
            type = serviceModel.type,
            tile = serviceModel.tile?.let { TileRefEntity.of(it) },
            active = serviceModel.active,
            details = serviceModel.details.getDetails().map { DetailLogEntryEntity.of(it) }
        )
    }

    fun asServiceModel() = Building(
        type = this.type,
        tile = this.tile?.asServiceModel(),
        active = this.active,
        details = DetailLog(this.details.mapMutable { it.asServiceModel() })
    )
}