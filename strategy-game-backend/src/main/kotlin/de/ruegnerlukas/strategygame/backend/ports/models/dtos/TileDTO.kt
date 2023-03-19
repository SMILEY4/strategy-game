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
	val influences: List<TileDTOCountryInfluence>,
	val owner: TileDTOOwner?,
	val content: List<TileDTOContent>
) {
	constructor(tile: TileEntity) : this(
		tileId = tile.key!!,
		position = tile.position,
		data = TileDTOData(tile.data.terrainType),
		influences = tile.influences.map { influence ->
			TileDTOCountryInfluence(
				influence.countryId,
				influence.totalValue,
				influence.sources.map { source ->
					TileDTOCityInfluence(
						source.cityId,
						source.provinceId,
						source.value
					)
				}
			)
		},
		owner = tile.owner?.let { TileDTOOwner(it.countryId, it.provinceId, it.cityId) },
		content = tile.content.map {
			when (it) {
				is MarkerTileContent -> MarkerTileDTOContent(it.countryId)
			}
		}
	)
}


data class TileDTOData(
	val terrainType: String,
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