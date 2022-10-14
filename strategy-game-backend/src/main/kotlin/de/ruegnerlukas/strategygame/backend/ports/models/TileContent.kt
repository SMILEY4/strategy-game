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
    JsonSubTypes.Type(value = MarkerTileContent::class),
    JsonSubTypes.Type(value = ScoutTileContent::class),
)
sealed class TileContent(
    val type: String
)


@JsonTypeName(MarkerTileContent.TYPE)
class MarkerTileContent(
    val countryId: String
) : TileContent(TYPE) {
    companion object {
        internal const val TYPE = "marker"
    }
}


@JsonTypeName(ScoutTileContent.TYPE)
class ScoutTileContent(
    val countryId: String,
    val turn: Int
) : TileContent(TYPE) {
    companion object {
        internal const val TYPE = "scout"
    }
}