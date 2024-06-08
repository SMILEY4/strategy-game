package io.github.smiley4.strategygame.backend.engine.external.persistence.models

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import io.github.smiley4.strategygame.backend.common.detaillog.BooleanDetailLogValue
import io.github.smiley4.strategygame.backend.common.detaillog.BuildingTypeDetailLogValue
import io.github.smiley4.strategygame.backend.common.detaillog.DetailLogValue
import io.github.smiley4.strategygame.backend.common.detaillog.FloatDetailLogValue
import io.github.smiley4.strategygame.backend.common.detaillog.IntDetailLogValue
import io.github.smiley4.strategygame.backend.common.detaillog.ResourcesDetailLogValue
import io.github.smiley4.strategygame.backend.common.detaillog.TileRefDetailLogValue
import io.github.smiley4.strategygame.backend.common.models.BuildingType
import io.github.smiley4.strategygame.backend.common.models.resources.ResourceCollection

@JsonTypeInfo(
    use = JsonTypeInfo.Id.MINIMAL_CLASS,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = BooleanDetailLogValueEntity::class),
    JsonSubTypes.Type(value = FloatDetailLogValueEntity::class),
    JsonSubTypes.Type(value = IntDetailLogValueEntity::class),
    JsonSubTypes.Type(value = BuildingTypeDetailLogValueEntity::class),
    JsonSubTypes.Type(value = ResourcesDetailLogValueEntity::class),
    JsonSubTypes.Type(value = TileRefDetailLogValueEntity::class),
)
sealed interface DetailLogValueEntity {
    companion object {

        fun of(serviceModel: DetailLogValue) = when (serviceModel) {
            is BooleanDetailLogValue -> BooleanDetailLogValueEntity(serviceModel.value)
            is FloatDetailLogValue -> FloatDetailLogValueEntity(serviceModel.value)
            is BuildingTypeDetailLogValue -> BuildingTypeDetailLogValueEntity(serviceModel.value)
            is IntDetailLogValue -> IntDetailLogValueEntity(serviceModel.value)
            is ResourcesDetailLogValue -> ResourcesDetailLogValueEntity(serviceModel.value.toStacks().map { ResourceStackEntity.of(it) })
            is TileRefDetailLogValue -> TileRefDetailLogValueEntity(TileRefEntity.of(serviceModel.value))
        }

    }

    fun asServiceModel() = when (this) {
        is BooleanDetailLogValueEntity -> BooleanDetailLogValue(this.value)
        is FloatDetailLogValueEntity -> FloatDetailLogValue(this.value)
        is BuildingTypeDetailLogValueEntity -> BuildingTypeDetailLogValue(this.value)
        is IntDetailLogValueEntity -> IntDetailLogValue(this.value)
        is ResourcesDetailLogValueEntity -> ResourcesDetailLogValue(ResourceCollection.basic(this.value.map { it.asServiceModel() }))
        is TileRefDetailLogValueEntity -> TileRefDetailLogValue(this.value.asServiceModel())
    }

}

class BooleanDetailLogValueEntity(var value: Boolean) : DetailLogValueEntity

class FloatDetailLogValueEntity(var value: Float) : DetailLogValueEntity

class IntDetailLogValueEntity(var value: Int) : DetailLogValueEntity

class BuildingTypeDetailLogValueEntity(var value: BuildingType) : DetailLogValueEntity

class ResourcesDetailLogValueEntity(var value: List<ResourceStackEntity>) : DetailLogValueEntity

class TileRefDetailLogValueEntity(var value: TileRefEntity) : DetailLogValueEntity