package de.ruegnerlukas.strategygame.backend.external.api.message.models

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.CreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceMarkerCommand
import de.ruegnerlukas.strategygame.backend.ports.models.PlaceScoutCommand
import de.ruegnerlukas.strategygame.backend.ports.models.PlayerCommand
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueAddEntryCommand
import de.ruegnerlukas.strategygame.backend.ports.models.ProductionQueueRemoveEntryCommand

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = PlaceMarkerCommandMsg::class),
    JsonSubTypes.Type(value = CreateCityCommandMsg::class),
    JsonSubTypes.Type(value = PlaceScoutCommandMsg::class),
    JsonSubTypes.Type(value = ProductionQueueAddEntryCommandMsg::class),
    JsonSubTypes.Type(value = ProductionQueueRemoveEntryCommandMsg::class),
)
sealed class PlayerCommandMsg(val type: String) {

    fun asServiceModel(): PlayerCommand {
        return when (this) {
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
            is ProductionQueueRemoveEntryCommandMsg -> ProductionQueueRemoveEntryCommand(
                cityId = this.cityId,
                queueEntryId = this.queueEntryId
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

@JsonTypeName(ProductionQueueRemoveEntryCommandMsg.TYPE)
class ProductionQueueRemoveEntryCommandMsg(
    val cityId: String,
    val queueEntryId: String
) : PlayerCommandMsg(TYPE) {
    companion object {
        internal const val TYPE = "production-queue-remove-entry"
    }
}