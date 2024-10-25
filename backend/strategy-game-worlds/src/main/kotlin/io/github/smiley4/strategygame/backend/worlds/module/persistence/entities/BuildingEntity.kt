package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.common.utils.mapMutable
import io.github.smiley4.strategygame.backend.commondata.Building
import io.github.smiley4.strategygame.backend.commondata.BuildingDetailType
import io.github.smiley4.strategygame.backend.commondata.BuildingRequirements
import io.github.smiley4.strategygame.backend.commondata.BuildingType
import io.github.smiley4.strategygame.backend.commondata.DetailLog


internal class BuildingEntity(
    val type: BuildingType,
    val tile: TileRefEntity?,
    val requirements: BuildingRequirementsEntity,
    val details: List<DetailLogEntryEntity<BuildingDetailType>>
) {

    companion object {
        fun of(serviceModel: Building) = BuildingEntity(
            type = serviceModel.type,
            tile = serviceModel.workedTile?.let { TileRefEntity.of(it) },
            requirements = BuildingRequirementsEntity(
                fulfillsTile = serviceModel.requirements.fulfillsTile,
                fulfillsInputResources = serviceModel.requirements.fulfillsInputResources
            ),
            details = serviceModel.details.getDetails().map { DetailLogEntryEntity.of(it) }
        )
    }

    fun asServiceModel() = Building(
        type = this.type,
        workedTile = this.tile?.asServiceModel(),
        requirements = BuildingRequirements(
            fulfillsTile = this.requirements.fulfillsTile,
            fulfillsInputResources = this.requirements.fulfillsInputResources
        ),
        details = DetailLog(this.details.mapMutable { it.asServiceModel() })
    )
}

internal class BuildingRequirementsEntity(
    var fulfillsTile: Boolean,
    var fulfillsInputResources: Boolean,
)