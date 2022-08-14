package de.ruegnerlukas.strategygame.backend.ports.models.dtos

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity

data class TileDTO(
	val tileId: String,
	val position: TilePosition,
	val data: TileDTOData,
	val content: List<TileDTOContent>
) {
	constructor(tile: TileEntity) : this(
		tile.key!!,
		tile.position,
		TileDTOData(tile.data.terrainType),
		tile.content.map {
			when (it) {
				is MarkerTileContent -> MarkerTileDTOContent(it.countryId)
			}
		}
	)
}


data class TileDTOData(
	var terrainType: String,
)


@JsonTypeInfo(
	use = JsonTypeInfo.Id.NAME,
	include = JsonTypeInfo.As.EXISTING_PROPERTY,
	property = "type"
)
@JsonSubTypes(
	JsonSubTypes.Type(value = MarkerTileDTOContent::class),
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