package de.ruegnerlukas.strategygame.backend.ports.models.entities

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName
import de.ruegnerlukas.strategygame.backend.shared.arango.DbEntity


class CommandEntity<T : CommandDataEntity>(
	val countryId: String,
	val turn: Int,
	val data: T
) : DbEntity()


@JsonTypeInfo(
	use = JsonTypeInfo.Id.NAME,
	include = JsonTypeInfo.As.EXISTING_PROPERTY,
	property = "type"
)
@JsonSubTypes(
	JsonSubTypes.Type(value = CreateCityCommandDataEntity::class),
	JsonSubTypes.Type(value = PlaceMarkerCommandDataEntity::class),
)
sealed class CommandDataEntity(
	val type: String
)


@JsonTypeName(CreateCityCommandDataEntity.TYPE)
class CreateCityCommandDataEntity(
	val q: Int,
	val r: Int,
	val name: String,
) : CommandDataEntity(TYPE) {
	companion object {
		internal const val TYPE = "create-city"
	}
}


@JsonTypeName(PlaceMarkerCommandDataEntity.TYPE)
class PlaceMarkerCommandDataEntity(
	val q: Int,
	val r: Int
) : CommandDataEntity(TYPE) {
	companion object {
		internal const val TYPE = "place-marker"
	}
}