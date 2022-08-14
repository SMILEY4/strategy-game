package de.ruegnerlukas.strategygame.backend.ports.models.entities

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.shared.arango.DbEntity

data class TileEntity(
	var gameId: String,
	val position: TilePositionEntity,
	val data: TileDataEntity,
	val content: MutableList<TileContentEntity>
) : DbEntity()


data class TilePositionEntity(
	var q: Int,
	var r: Int
)


data class TileDataEntity(
	var terrainType: String,
)


@JsonTypeInfo(
	use = JsonTypeInfo.Id.NAME,
	include = JsonTypeInfo.As.EXISTING_PROPERTY,
	property = "type"
)
@JsonSubTypes(
	JsonSubTypes.Type(value = MarkerTileContentEntity::class),
)
sealed class TileContentEntity(
	val type: String
)


@JsonTypeName(MarkerTileContentEntity.TYPE)
class MarkerTileContentEntity(
	val countryId: String
) : TileContentEntity(TYPE) {
	companion object {
		internal const val TYPE = "marker"
	}
}