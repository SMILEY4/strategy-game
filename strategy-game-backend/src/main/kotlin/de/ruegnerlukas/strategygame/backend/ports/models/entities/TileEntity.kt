package de.ruegnerlukas.strategygame.backend.ports.models.entities

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.shared.arango.DbEntity

data class TileEntity(
	var gameId: String,
	val position: TilePosition,
	val data: TileData,
	val influences: MutableList<TileCountryInfluence>,
	var ownerCountryId: String?,
	val content: MutableList<TileContent>
) : DbEntity()


data class TileData(
	var terrainType: String,
)


data class TileCountryInfluence(
	val countryId: String,
	var value: Double,
)


@JsonTypeInfo(
	use = JsonTypeInfo.Id.NAME,
	include = JsonTypeInfo.As.EXISTING_PROPERTY,
	property = "type"
)
@JsonSubTypes(
	JsonSubTypes.Type(value = MarkerTileContent::class),
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