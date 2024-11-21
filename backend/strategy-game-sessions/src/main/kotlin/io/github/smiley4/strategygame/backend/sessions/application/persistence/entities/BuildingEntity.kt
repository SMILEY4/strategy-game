package io.github.smiley4.strategygame.backend.sessions.application.persistence.entities

import io.github.smiley4.strategygame.backend.commondata.Building
import io.github.smiley4.strategygame.backend.commondata.BuildingActivity
import io.github.smiley4.strategygame.backend.commondata.BuildingType
import io.github.smiley4.strategygame.backend.commondata.BuildingValidity
import io.github.smiley4.strategygame.backend.commondata.ResourceCollection


internal class BuildingEntity(
    val type: BuildingType,
    val tile: TileRefEntity?,
    val requirements: BuildingValidityEntity,
    val activity: BuildingActivityEntity
) {

    companion object {
        fun of(serviceModel: Building) = BuildingEntity(
            type = serviceModel.type,
            tile = serviceModel.workedTile?.let { TileRefEntity.of(it) },
            requirements = BuildingValidityEntity(
                validTile = serviceModel.validity.workTile,
                validInputResources = serviceModel.validity.inputResources
            ),
            activity = BuildingActivityEntity(
                consumed = serviceModel.activity.consumed.toStacks(false).map { ResourceStackEntity.of(it) },
                produced = serviceModel.activity.produced.toStacks(false).map { ResourceStackEntity.of(it) },
                missing = serviceModel.activity.missing.toStacks(false).map { ResourceStackEntity.of(it) },
            )
        )
    }

    fun asServiceModel() = Building(
        type = this.type,
        workedTile = this.tile?.asServiceModel(),
        validity = BuildingValidity(
            workTile = this.requirements.validTile,
            inputResources = this.requirements.validInputResources
        ),
        activity = BuildingActivity(
            consumed = ResourceCollection.basic(this.activity.consumed.map { it.asServiceModel() }),
            produced = ResourceCollection.basic(this.activity.produced.map { it.asServiceModel() }),
            missing = ResourceCollection.basic(this.activity.missing.map { it.asServiceModel() })
        )
    )
}

internal class BuildingValidityEntity(
    var validTile: Boolean,
    var validInputResources: Boolean,
)

internal class BuildingActivityEntity(
    val consumed: List<ResourceStackEntity>,
    val produced: List<ResourceStackEntity>,
    val missing: List<ResourceStackEntity>
)