package de.ruegnerlukas.strategygame.backend.common.detaillog.entity

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import de.ruegnerlukas.strategygame.backend.common.detaillog.BuildingTypeDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.FloatDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.IntDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.models.BuildingType

@JsonTypeInfo(
    use = JsonTypeInfo.Id.MINIMAL_CLASS,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = FloatDetailLogValueEntity::class),
    JsonSubTypes.Type(value = IntDetailLogValueEntity::class),
    JsonSubTypes.Type(value = BuildingTypeDetailLogValueEntity::class),
)
sealed interface DetailLogValueEntity {
    companion object {

        fun of(serviceModel: DetailLogValue) = when (serviceModel) {
            is FloatDetailLogValue -> FloatDetailLogValueEntity(serviceModel.value)
            is BuildingTypeDetailLogValue -> BuildingTypeDetailLogValueEntity(serviceModel.value)
            is IntDetailLogValue -> IntDetailLogValueEntity(serviceModel.value)
        }

    }

    fun asServiceModel() = when (this) {
        is FloatDetailLogValueEntity -> FloatDetailLogValue(this.value)
        is BuildingTypeDetailLogValueEntity -> BuildingTypeDetailLogValue(this.value)
        is IntDetailLogValueEntity -> IntDetailLogValue(this.value)
    }

}


class FloatDetailLogValueEntity(var value: Float) : DetailLogValueEntity

class IntDetailLogValueEntity(var value: Int) : DetailLogValueEntity

class BuildingTypeDetailLogValueEntity(var value: BuildingType) : DetailLogValueEntity