package de.ruegnerlukas.strategygame.backend.ports.models.dtos

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition

data class TileDTO(
    val baseData: TileDTOBaseData,
    val generalData: TileDTOGeneralData?,
    val advancedData: TileDTOAdvancedData?,
)


enum class TileDTOVisibility {
    UNKNOWN,
    DISCOVERED,
    VISIBLE
}


/**
 * The data that is always available
 */
data class TileDTOBaseData(
    val tileId: String,
    val position: TilePosition,
    val visibility: TileDTOVisibility,
)


/**
 * The data that is available for discovered and visible tiles
 */
data class TileDTOGeneralData(
    val terrainType: String,
    val owner: TileDTOOwner?,
)


/**
 * The data that is available for visible tiles
 */
data class TileDTOAdvancedData(
    val influences: List<TileDTOCountryInfluence>,
    val content: List<TileDTOContent>
)


data class TileDTOOwner(
    val countryId: String,
    val provinceId: String,
    val cityId: String
)

data class TileDTOCountryInfluence(
    val countryId: String,
    val value: Double,
    val sources: List<TileDTOCityInfluence>
)

data class TileDTOCityInfluence(
    val cityId: String,
    val provinceId: String,
    val value: Double
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