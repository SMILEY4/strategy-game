package de.ruegnerlukas.strategygame.backend.ports.models

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.DbEntity


class Command<T : CommandData>(
    val countryId: String,
    val turn: Int,
    val data: T
) : DbEntity()


@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = CreateCityCommandData::class),
    JsonSubTypes.Type(value = CreateTownCommandData::class),
    JsonSubTypes.Type(value = CreateBuildingCommandData::class),
    JsonSubTypes.Type(value = PlaceMarkerCommandData::class),
    JsonSubTypes.Type(value = PlaceScoutCommandData::class),
)
sealed class CommandData(
    val type: String
)


@JsonTypeName(CreateCityCommandData.TYPE)
class CreateCityCommandData(
    val q: Int,
    val r: Int,
    val name: String,
) : CommandData(TYPE) {
    companion object {
        internal const val TYPE = "create-city"
    }
}


@JsonTypeName(CreateTownCommandData.TYPE)
class CreateTownCommandData(
    val q: Int,
    val r: Int,
    val name: String,
    val parentCity: String
) : CommandData(TYPE) {
    companion object {
        internal const val TYPE = "create-town"
    }
}


@JsonTypeName(CreateBuildingCommandData.TYPE)
class CreateBuildingCommandData(
    val cityId: String,
    val buildingType: BuildingType,
) : CommandData(TYPE) {
    companion object {
        internal const val TYPE = "create-building"
    }
}


@JsonTypeName(PlaceMarkerCommandData.TYPE)
class PlaceMarkerCommandData(
    val q: Int,
    val r: Int
) : CommandData(TYPE) {
    companion object {
        internal const val TYPE = "place-marker"
    }
}


@JsonTypeName(PlaceScoutCommandData.TYPE)
class PlaceScoutCommandData(
    val q: Int,
    val r: Int
) : CommandData(TYPE) {
    companion object {
        internal const val TYPE = "place-scout"
    }
}