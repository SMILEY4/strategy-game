package de.ruegnerlukas.strategygame.backend.ports.models.gamelobby

import kotlinx.serialization.Serializable


enum class CommandType {
	PLACE_MARKER,
}


@Serializable
data class PlaceMarkerCommand(
	val userId: String,
	val q: Int,
	val r: Int,
	val commandType: CommandType = CommandType.PLACE_MARKER
)
