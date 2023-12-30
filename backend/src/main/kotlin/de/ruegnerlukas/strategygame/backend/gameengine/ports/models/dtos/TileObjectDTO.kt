package de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileRef

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = MarkerTileObjectDTO::class),
    JsonSubTypes.Type(value = ScoutTileObjectDTO::class),
    JsonSubTypes.Type(value = CityTileObjectDTO::class),
)
sealed class TileObjectDTO(
    val type: String,
    val countryId: String,
)


@JsonTypeName(MarkerTileObjectDTO.TYPE)
class MarkerTileObjectDTO(
    countryId: String,
) : TileObjectDTO(TYPE, countryId) {
    companion object {
        internal const val TYPE = "marker"
    }
}

@JsonTypeName(ScoutTileObjectDTO.TYPE)
class ScoutTileObjectDTO(
    countryId: String,
    val creationTurn: Int,
) : TileObjectDTO(TYPE, countryId) {
    companion object {
        internal const val TYPE = "scout"
    }
}


@JsonTypeName(CityTileObjectDTO.TYPE)
class CityTileObjectDTO(
    countryId: String,
    val cityId: String,
) : TileObjectDTO(TYPE, countryId) {
    companion object {
        internal const val TYPE = "city"
    }
}
