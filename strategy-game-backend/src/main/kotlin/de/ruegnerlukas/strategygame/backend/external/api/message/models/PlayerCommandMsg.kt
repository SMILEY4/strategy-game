package de.ruegnerlukas.strategygame.backend.external.api.message.models

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.CreateBuildingCommand
import de.ruegnerlukas.strategygame.backend.ports.models.CreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceScoutCommand
import de.ruegnerlukas.strategygame.backend.ports.models.PlayerCommand
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueAddEntryCommand

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = PlaceMarkerCommandMsg::class),
    JsonSubTypes.Type(value = CreateCityCommandMsg::class),
    JsonSubTypes.Type(value = CreateBuildingCommandMsg::class),
    JsonSubTypes.Type(value = PlaceScoutCommandMsg::class),
    JsonSubTypes.Type(value = ProductionQueueAddEntryCommandMsg::class),
)
sealed class PlayerCommandMsg(val type: String) {

    fun asServiceModel(): PlayerCommand {
        return when (this) {
            is CreateBuildingCommandMsg -> CreateBuildingCommand(
                cityId = this.cityId,
                buildingType = this.buildingType
            )
            is CreateCityCommandMsg -> CreateCityCommand(
                q = this.q,
                r = this.r,
                name = this.name,
                withNewProvince = this.withNewProvince
            )
            is PlaceMarkerCommandMsg -> PlaceMarkerCommand(
                q = this.q,
                r = this.r
            )
            is PlaceScoutCommandMsg -> PlaceScoutCommand(
                q = this.q,
                r = this.r
            )
            is ProductionQueueAddEntryCommandMsg -> ProductionQueueAddEntryCommand(
                cityId = this.cityId,
                buildingType = this.buildingType
            )
        }
    }

}


@JsonTypeName(PlaceMarkerCommandMsg.TYPE)
class PlaceMarkerCommandMsg(
    val q: Int,
    val r: Int,
) : PlayerCommandMsg(TYPE) {
    companion object {
        internal const val TYPE = "place-marker"
    }
}


@JsonTypeName(CreateCityCommandMsg.TYPE)
class CreateCityCommandMsg(
    val q: Int,
    val r: Int,
    val name: String,
    val withNewProvince: Boolean
) : PlayerCommandMsg(TYPE) {
    companion object {
        internal const val TYPE = "create-city"
    }
}


@JsonTypeName(CreateBuildingCommandMsg.TYPE)
class CreateBuildingCommandMsg(
    val cityId: String,
    val buildingType: BuildingType,
) : PlayerCommandMsg(TYPE) {
    companion object {
        internal const val TYPE = "create-building"
    }
}


@JsonTypeName(PlaceScoutCommandMsg.TYPE)
class PlaceScoutCommandMsg(
    val q: Int,
    val r: Int,
) : PlayerCommandMsg(TYPE) {
    companion object {
        internal const val TYPE = "place-scout"
    }
}


@JsonTypeName(ProductionQueueAddEntryCommandMsg.TYPE)
class ProductionQueueAddEntryCommandMsg(
    val cityId: String,
    val buildingType: BuildingType
) : PlayerCommandMsg(TYPE) {
    companion object {
        internal const val TYPE = "production-queue-add-entry"
    }
}