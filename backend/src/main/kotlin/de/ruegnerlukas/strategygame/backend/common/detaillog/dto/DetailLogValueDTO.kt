package de.ruegnerlukas.strategygame.backend.common.detaillog.dto

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.common.detaillog.BuildingTypeDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.FloatDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.IntDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.models.BuildingType
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.MarkerTileDTOContent

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = FloatDetailLogValueDTO::class),
    JsonSubTypes.Type(value = IntDetailLogValueDTO::class),
    JsonSubTypes.Type(value = BuildingTypeDetailLogValueDTO::class),
)
sealed class DetailLogValueDTO(
    val type: String
) {

    companion object {

        fun of(serviceModel: DetailLogValue) = when (serviceModel) {
            is FloatDetailLogValue -> FloatDetailLogValueDTO(serviceModel.value)
            is BuildingTypeDetailLogValue -> BuildingTypeDetailLogValueDTO(serviceModel.value)
            is IntDetailLogValue -> IntDetailLogValueDTO(serviceModel.value)
        }

    }

    fun asServiceModel() = when (this) {
        is FloatDetailLogValueDTO -> FloatDetailLogValue(this.value)
        is BuildingTypeDetailLogValueDTO -> BuildingTypeDetailLogValue(this.value)
        is IntDetailLogValueDTO -> IntDetailLogValue(this.value)
    }

}

@JsonTypeName(FloatDetailLogValueDTO.TYPE)
class FloatDetailLogValueDTO(var value: Float) : DetailLogValueDTO(TYPE) {
    companion object {
        internal const val TYPE = "float"
    }
}

@JsonTypeName(IntDetailLogValueDTO.TYPE)
class IntDetailLogValueDTO(var value: Int) : DetailLogValueDTO(TYPE) {
    companion object {
        internal const val TYPE = "int"
    }
}

@JsonTypeName(BuildingTypeDetailLogValueDTO.TYPE)
class BuildingTypeDetailLogValueDTO(var value: BuildingType) : DetailLogValueDTO(TYPE) {
    companion object {
        internal const val TYPE = "building"
    }
}