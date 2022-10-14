package de.ruegnerlukas.strategygame.backend.ports.models

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = PlaceMarkerCommand::class),
    JsonSubTypes.Type(value = CreateCityCommand::class),
    JsonSubTypes.Type(value = CreateBuildingCommand::class),
    JsonSubTypes.Type(value = PlaceScoutCommand::class),
)
sealed class PlayerCommand(
    val type: String,
)


@JsonTypeName(PlaceMarkerCommand.TYPE)
class PlaceMarkerCommand(
    val q: Int,
    val r: Int,
) : PlayerCommand(TYPE) {
    companion object {
        internal const val TYPE = "place-marker"
    }
}


@JsonTypeName(CreateCityCommand.TYPE)
class CreateCityCommand(
    val q: Int,
    val r: Int,
    val name: String,
    val parentCity: String?
) : PlayerCommand(TYPE) {
    companion object {
        internal const val TYPE = "create-city"
    }
}


@JsonTypeName(CreateBuildingCommand.TYPE)
class CreateBuildingCommand(
    val cityId: String,
    val buildingType: BuildingType,
) : PlayerCommand(TYPE) {
    companion object {
        internal const val TYPE = "create-building"
    }
}


@JsonTypeName(PlaceScoutCommand.TYPE)
class PlaceScoutCommand(
    val q: Int,
    val r: Int,
) : PlayerCommand(TYPE) {
    companion object {
        internal const val TYPE = "place-scout"
    }
}