package de.ruegnerlukas.strategygame.backend.ports.models.entities

import com.arangodb.entity.Key
import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.ports.models.game.CreateCityCommand
import de.ruegnerlukas.strategygame.backend.ports.models.game.PlaceMarkerCommand

data class TileEntity(
	@Key val id: String? = null,
	var gameId: String,
	val position: TilePositionEntity,
	val data: TileDataEntity,
	val content: MutableList<TileContentEntity>
)


data class TilePositionEntity(
	var q: Int,
	var r: Int
)


data class TileDataEntity(
	var terrainType: String,
	var countryId: String?
)


@JsonTypeInfo(
	use = JsonTypeInfo.Id.NAME,
	include = JsonTypeInfo.As.EXISTING_PROPERTY,
	property = "type"
)
@JsonSubTypes(
	JsonSubTypes.Type(value = PlaceMarkerCommand::class),
	JsonSubTypes.Type(value = CreateCityCommand::class),
)
sealed class TileContentEntity(
	val type: String
)


@JsonTypeName(CityTileContentEntity.TYPE)
class CityTileContentEntity() : TileContentEntity(TYPE) {
	companion object {
		internal const val TYPE = "city"
	}
}