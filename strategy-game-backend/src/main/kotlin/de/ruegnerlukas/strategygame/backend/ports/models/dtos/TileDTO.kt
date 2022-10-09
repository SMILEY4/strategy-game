package de.ruegnerlukas.strategygame.backend.ports.models.dtos

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition

data class TileDTO(
    val dataTier0: TileDTODataTier0,
    val dataTier1: TileDTODataTier1?,
    val dataTier2: TileDTODataTier2?,
)


enum class TileDTOVisibility {
    UNKNOWN,
    DISCOVERED,
    VISIBLE
}


/**
 * The data that is always available
 */
data class TileDTODataTier0(
    val tileId: String,
    val position: TilePosition,
    val visibility: TileDTOVisibility,
)


/**
 * The data that is available for discovered and visible tiles
 */
data class TileDTODataTier1(
    val terrainType: String,
    val resourceType: String,
    val owner: TileDTOOwner?,
)


/**
 * The data that is available for visible tiles
 */
data class TileDTODataTier2(
    val influences: List<TileDTOInfluence>,
    val content: List<TileDTOContent>
)


data class TileDTOOwner(
    val countryId: String,
    val cityId: String
)


data class TileDTOInfluence(
    val countryId: String,
    val cityId: String,
    val amount: Double
)


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