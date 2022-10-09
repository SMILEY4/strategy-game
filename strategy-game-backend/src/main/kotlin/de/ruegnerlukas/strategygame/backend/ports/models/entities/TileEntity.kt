package de.ruegnerlukas.strategygame.backend.ports.models.entities

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition

data class TileEntity(
    var gameId: String,
    val position: TilePosition,
    val data: TileData,
    val influences: MutableList<TileInfluence>,
    var owner: TileOwner?,
    val discoveredByCountries: MutableList<String>,
    val content: MutableList<TileContent>
) : DbEntity()


data class TileData(
    var terrainType: String,
    var resourceType: String,
)

data class TileOwner(
    val countryId: String,
    val cityId: String
)

data class TileInfluence(
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