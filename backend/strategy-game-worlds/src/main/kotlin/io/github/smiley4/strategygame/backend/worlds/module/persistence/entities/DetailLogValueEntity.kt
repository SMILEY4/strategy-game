package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import com.fasterxml.jackson.annotation.JsonTypeInfo
import io.github.smiley4.strategygame.backend.commondata.BooleanDetailLogValue
import io.github.smiley4.strategygame.backend.commondata.BuildingType
import io.github.smiley4.strategygame.backend.commondata.BuildingTypeDetailLogValue
import io.github.smiley4.strategygame.backend.commondata.DetailLogValue
import io.github.smiley4.strategygame.backend.commondata.FloatDetailLogValue
import io.github.smiley4.strategygame.backend.commondata.IntDetailLogValue
import io.github.smiley4.strategygame.backend.commondata.ResourceCollection
import io.github.smiley4.strategygame.backend.commondata.ResourcesDetailLogValue
import io.github.smiley4.strategygame.backend.commondata.TextDetailLogValue
import io.github.smiley4.strategygame.backend.commondata.TileRefDetailLogValue

@JsonTypeInfo(
    use = JsonTypeInfo.Id.MINIMAL_CLASS,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
internal sealed interface DetailLogValueEntity {
    companion object {

        fun of(serviceModel: DetailLogValue) = when (serviceModel) {
            is TextDetailLogValue -> TextDetailLogValueEntity(serviceModel.value)
            is BooleanDetailLogValue -> BooleanDetailLogValueEntity(serviceModel.value)
            is FloatDetailLogValue -> FloatDetailLogValueEntity(serviceModel.value)
            is BuildingTypeDetailLogValue -> BuildingTypeDetailLogValueEntity(serviceModel.value)
            is IntDetailLogValue -> IntDetailLogValueEntity(serviceModel.value)
            is ResourcesDetailLogValue -> ResourcesDetailLogValueEntity(serviceModel.value.toStacks().map { ResourceStackEntity.of(it) })
            is TileRefDetailLogValue -> TileRefDetailLogValueEntity(TileRefEntity.of(serviceModel.value))
        }

    }

    fun asServiceModel() = when (this) {
        is TextDetailLogValueEntity -> TextDetailLogValue(this.value)
        is BooleanDetailLogValueEntity -> BooleanDetailLogValue(this.value)
        is FloatDetailLogValueEntity -> FloatDetailLogValue(this.value)
        is BuildingTypeDetailLogValueEntity -> BuildingTypeDetailLogValue(this.value)
        is IntDetailLogValueEntity -> IntDetailLogValue(this.value)
        is ResourcesDetailLogValueEntity -> ResourcesDetailLogValue(ResourceCollection.basic(this.value.map { it.asServiceModel() }))
        is TileRefDetailLogValueEntity -> TileRefDetailLogValue(this.value.asServiceModel())
    }

}

internal class TextDetailLogValueEntity(var value: String) : DetailLogValueEntity

internal class BooleanDetailLogValueEntity(var value: Boolean) : DetailLogValueEntity

internal class FloatDetailLogValueEntity(var value: Float) : DetailLogValueEntity

internal class IntDetailLogValueEntity(var value: Int) : DetailLogValueEntity

internal class BuildingTypeDetailLogValueEntity(var value: BuildingType) : DetailLogValueEntity

internal class ResourcesDetailLogValueEntity(var value: List<ResourceStackEntity>) : DetailLogValueEntity

internal class TileRefDetailLogValueEntity(var value: TileRefEntity) : DetailLogValueEntity