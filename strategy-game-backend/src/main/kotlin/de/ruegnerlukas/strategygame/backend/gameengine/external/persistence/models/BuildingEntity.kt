package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import de.ruegnerlukas.strategygame.backend.common.models.BuildingType
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Building

class BuildingEntity(
    val type: BuildingType,
    val tile: TileRefEntity?,
    val active: Boolean
) {

    companion object {
        fun of(serviceModel: Building) = BuildingEntity(
            type = serviceModel.type,
            tile = serviceModel.tile?.let { TileRefEntity.of(it) },
            active = serviceModel.active
        )
    }

    fun asServiceModel() = Building(
        type = this.type,
        tile = this.tile?.asServiceModel(),
        active = this.active
    )
}