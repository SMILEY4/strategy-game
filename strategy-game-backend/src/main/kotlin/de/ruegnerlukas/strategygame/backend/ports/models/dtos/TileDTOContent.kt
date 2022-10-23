package de.ruegnerlukas.strategygame.backend.ports.models.dtos

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.EXISTING_PROPERTY,
    property = "type"
)
@JsonSubTypes(
    JsonSubTypes.Type(value = MarkerTileDTOContent::class),
    JsonSubTypes.Type(value = ScoutTileDTOContent::class),
)
sealed class TileDTOContent(
    val type: String
)


@JsonTypeName(MarkerTileDTOContent.TYPE)
class MarkerTileDTOContent(
    val countryId: String
) : TileDTOContent(TYPE) {
    companion object {
        internal const val TYPE = "marker"
    }
}


@JsonTypeName(ScoutTileDTOContent.TYPE)
class ScoutTileDTOContent(
    val countryId: String,
    val turn: Int
) : TileDTOContent(TYPE) {
    companion object {
        internal const val TYPE = "scout"
    }
}