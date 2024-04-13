package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLog
import de.ruegnerlukas.strategygame.backend.common.detaillog.entity.DetailLogEntryEntity
import de.ruegnerlukas.strategygame.backend.common.models.BuildingType
import de.ruegnerlukas.strategygame.backend.common.utils.mapMutable
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Building
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.BuildingDetailType

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