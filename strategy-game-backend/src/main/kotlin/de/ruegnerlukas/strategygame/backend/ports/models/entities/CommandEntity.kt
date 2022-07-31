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
			val q: Int,
			val r: Int
		)

		data class CreateCityCommandData(
			val q: Int,
			val r: Int
		)

	}

}