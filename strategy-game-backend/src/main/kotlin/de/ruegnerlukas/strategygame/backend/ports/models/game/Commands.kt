package de.ruegnerlukas.strategygame.backend.ports.models.game

enum class CommandType {
	PLACE_MARKER,
}


data class PlaceMarkerCommand(
	val userId: String,
	val q: Int,
	val r: Int,
	val commandType: CommandType = CommandType.PLACE_MARKER
)
