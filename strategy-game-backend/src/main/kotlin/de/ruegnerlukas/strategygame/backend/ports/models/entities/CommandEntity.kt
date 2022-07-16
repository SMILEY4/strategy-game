package de.ruegnerlukas.strategygame.backend.ports.models.entities

data class CommandEntity(
	val id: String,
	val playerId: String,
	val turn: Int,
	val type: String,
	val data: String
) {

	companion object {

		data class PlaceMarkerCommandData(
			val tileId: String
		)

		data class CreateCityCommandData(
			val tileId: String
		)

	}

}