package de.ruegnerlukas.strategygame.backend.common.detaillog.dto

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.common.detaillog.BooleanDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.BuildingTypeDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.FloatDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.IntDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.ResourcesDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.detaillog.TileRefDetailLogValue
import de.ruegnerlukas.strategygame.backend.common.models.BuildingType
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceStack
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileRef

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = BooleanDetailLogValueDTO::class),
    JsonSubTypes.Type(value = FloatDetailLogValueDTO::class),
    JsonSubTypes.Type(value = IntDetailLogValueDTO::class),
    JsonSubTypes.Type(value = BuildingTypeDetailLogValueDTO::class),
    JsonSubTypes.Type(value = ResourcesDetailLogValueDTO::class),
    JsonSubTypes.Type(value = TileRefDetailLogValueDTO::class),

    )
sealed class DetailLogValueDTO(
    val type: String
) {

    companion object {

        fun of(serviceModel: DetailLogValue) = when (serviceModel) {
            is FloatDetailLogValue -> FloatDetailLogValueDTO(serviceModel.value)
            is BuildingTypeDetailLogValue -> BuildingTypeDetailLogValueDTO(serviceModel.value)
            is IntDetailLogValue -> IntDetailLogValueDTO(serviceModel.value)
            is BooleanDetailLogValue -> BooleanDetailLogValueDTO(serviceModel.value)
            is ResourcesDetailLogValue -> ResourcesDetailLogValueDTO(serviceModel.value.toStacks(false))
            is TileRefDetailLogValue -> TileRefDetailLogValueDTO(serviceModel.value)
        }

    }

    fun asServiceModel() = when (this) {
        is FloatDetailLogValueDTO -> FloatDetailLogValue(this.value)
        is BuildingTypeDetailLogValueDTO -> BuildingTypeDetailLogValue(this.value)
        is IntDetailLogValueDTO -> IntDetailLogValue(this.value)
        is BooleanDetailLogValueDTO -> BooleanDetailLogValue(this.value)
        is ResourcesDetailLogValueDTO -> ResourcesDetailLogValue(ResourceCollection.basic(this.value))
        is TileRefDetailLogValueDTO -> TileRefDetailLogValue(this.value)
    }

}


@JsonTypeName(BooleanDetailLogValueDTO.TYPE)
class BooleanDetailLogValueDTO(var value: Boolean) : DetailLogValueDTO(TYPE) {
    companion object {
        internal const val TYPE = "boolean"
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


@JsonTypeName(TileRefDetailLogValueDTO.TYPE)
class TileRefDetailLogValueDTO(var value: TileRef) : DetailLogValueDTO(TYPE) {
    companion object {
        internal const val TYPE = "tile"
    }
}


@JsonTypeName(ResourcesDetailLogValueDTO.TYPE)
class ResourcesDetailLogValueDTO(var value: Collection<ResourceStack>) : DetailLogValueDTO(TYPE) {
    companion object {
        internal const val TYPE = "resources"
    }
}