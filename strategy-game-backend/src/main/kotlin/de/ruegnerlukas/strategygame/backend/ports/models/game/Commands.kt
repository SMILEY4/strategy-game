package de.ruegnerlukas.strategygame.backend.ports.models.game

import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.JsonTypeName

@JsonTypeInfo(
	use = JsonTypeInfo.Id.NAME,
	include = JsonTypeInfo.As.EXISTING_PROPERTY,
	property = "type"
)
@JsonSubTypes(
	JsonSubTypes.Type(value = PlaceMarkerCommand::class),
	JsonSubTypes.Type(value = CreateCityCommand::class),
)
sealed class PlayerCommand(
	val type: String,
)


@JsonTypeName(PlaceMarkerCommand.TYPE)
class PlaceMarkerCommand(
	val q: Int,
	val r: Int,
) : PlayerCommand(TYPE) {
	companion object {
		internal const val TYPE = "place-marker"
	}
}


@JsonTypeName(CreateCityCommand.TYPE)
class CreateCityCommand(
	val q: Int,
	val r: Int,
	val name: String,
) : PlayerCommand(TYPE) {
	companion object {
		internal const val TYPE = "create-city"
	}
}
